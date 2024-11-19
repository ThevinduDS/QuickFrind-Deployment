const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const passport = require('passport');// for google login
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user.model');
const rateLimiter = require('../config/rateLimiter');
const transporter = require('../config/mailer'); // Import the mailer module

// Common validation and sanitization rules
const userValidationRules = [
    body('firstName')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('First name is required.'),
    body('lastName')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('Last name is required.'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email.'),
    body('phone')
        .matches(/^(0?77|0?76|0?74|0?71|0?72|0?75)\d{6,7}$/)
        .withMessage('Invalid Sri Lankan phone number.'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.')
        .custom((value) => {
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasDigit = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
                throw new Error('Password must include uppercase, lowercase, a digit, and a special character.');
            }
            return true;
        }),
];

// User Registration
exports.register = [
    ...userValidationRules,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            const { firstName, lastName, email, phone, password, role } = req.body;

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists.' });
            }

            const user = await User.create({
                firstName,
                lastName,
                email,
                phone,
                password: await bcrypt.hash(password, 10),
                role: role || 'customer',
                emailVerified: false,
            });

            const verificationToken = jwt.sign(
                { email: user.email },
                config.jwt.secret,
                { expiresIn: '1d' }
            );

            const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
            const mailOptions = {
                from: config.email.from,
                to: user.email,
                subject: 'Verify Your Email Address',
                html: `
                    <h1>Hi ${firstName},</h1>
                    <p>Thank you for registering in QuickFind.LK! Please verify your email address by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
                `,
            };

            await transporter.sendMail(mailOptions);

            res.status(201).json({
                success: true,
                message: 'Registration successful! Check your email for verification.',
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Error registering user.' });
        }
    },
];

// Email Verification
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is missing.' });
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const { email } = decoded;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        if (user.emailVerified) {
            return res.status(200).json({ success: true, message: 'Email already verified' });
        }
        user.emailVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
};


// User Login
exports.login = [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            await rateLimiter.consume(req.ip);
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }
            if (!user.emailVerified) {
                return res.status(403).json({ success: false, message: 'Email not verified.' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, { expiresIn: '24h' });
            res.json({
                success: true,
                token,
                user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email, role: user.role },
            });
        } catch (rateLimiterError) {
            res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
        }
    },
];

// Password Reset Request
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Email not found.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            from: `"QuickFind Support" <${config.email.from}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested to reset your password. Click the link below:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>Link expires in 1 hour.</p>
            `,
        });

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
};

// Password Reset
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            where: { resetToken: hashedToken, resetTokenExpiry: { [Op.gt]: Date.now() } },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
};

//about google log
// exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// exports.googleAuthCallback = (req, res) => {
//     // Passport will attach the user and token from GoogleStrategy
//     const { user, token } = req.user;

//     // Redirect the user to the frontend home page with the token as a query parameter
//     // const redirectUrl = `http://127.0.0.1:5500/frontend/pages/auth/index.html?token=${token}`; // Replace with your frontend home page URL
//     // res.redirect(redirectUrl);

//     // res.json({
//     //     message: 'Google login successful!',
//     //     user,
//     //     token,
//     // });

    
// };
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};