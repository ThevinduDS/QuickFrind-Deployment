const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const rateLimiter = require('../config/rateLimiter');
const transporter = require('../config/mailer'); // Import the mailer module

// Common validation and sanitization rules
const userValidationRules = [
    body('firstName')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('First name required.'),

    body('lastName')
        .trim()
        .escape()
        .isLength({ min: 1 })
        .withMessage('Last name required.'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email.'),

    body('phone')
        .matches(/^(0?77|0?76|0?74|0?71|0?72|0?75)\d{6,7}$/)
        .withMessage('Invalid Sri Lankan phone number.'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Invalid password')
        .custom((value) => {
            const hasUpperCase = /[A-Z]/.test(value);
            const hasLowerCase = /[a-z]/.test(value);
            const hasDigit = /\d/.test(value);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

            if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
                throw new Error('Invalid password');
            }
            return true;
        }),
];

// Register
exports.register = [
    ...userValidationRules,
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { firstName, lastName, email, phone, password, role } = req.body;

            // Check if the user already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // Create the user in the database
            const user = await User.create({
                firstName,
                lastName,
                email,
                phone,
                password: await bcrypt.hash(password, 10),
                role: role || 'customer',
                emailVerified: false, // Add emailVerified field to the user table
            });

            // Generate a verification token
            const verificationToken = jwt.sign(
                { email: user.email },
                config.jwt.secret,
                { expiresIn: '1d' } // Token expires in 1 day
            );

            // Send the verification email
            const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;
            const mailOptions = {
                from: config.email.from,
                to: user.email,
                subject: 'Verify Your Email Address',
                html: `
                <!DOCTYPE html>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F0F4F8; margin: 0; padding: 0;">
    <table style="width: 100%; max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <tr>
                    <div style="text-align: center; padding: 10px 0;">
            <h1 style="font-size: 2.25rem; font-weight: bold; color: #1e40af;">QuickFind.LK</h1>
        </div>
        </tr>
        <!-- Body -->
        <tr>
            <td style="padding: 20px; color: #64748B; text-align: center;">
                <p style="font-size: 16px; margin: 0;">Hi ${firstName},</p>
                <p style="font-size: 14px; margin: 10px 0 20px;">
                    Thank you for joining <span style="color: #1E40AF; font-weight: bold;">QuickFind.LK</span>! We're thrilled to have you on board.
                </p>
                <p style="font-size: 14px; margin: 10px 0;">
                    Please verify your email address to activate your account and start exploring our services.
                </p>
                <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #1E40AF; color: #FFFFFF; text-decoration: none; font-weight: bold; border-radius: 5px;">Verify Email Address</a>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td style="padding: 20px; text-align: center; font-size: 12px; color: #64748B;">
                <p>If you didn’t create an account, no further action is required.</p>
                <p>Need help? <a href="https://quickfind.lk/support" style="color: #1E40AF; text-decoration: underline;">Contact our support team</a>.</p>
            </td>
        </tr>
    </table>
</body>
</html>


                `,
            };

            // Send email using the transporter
            await transporter.sendMail(mailOptions);

            res.status(201).json({
                success: true,
                message: 'Registration successful! Please check your email to verify your account.',
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Error registering user' });
        }
    },
];

// Verify Email
exports.verifyEmail = async (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is missing' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, config.jwt.secret);
        const { email } = decoded;

        // Find the user and update emailVerified to true
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(200).redirect('/loginpage');
        }

        user.emailVerified = true;
        await user.save();

        // Redirect to login page after successful verification
        res.status(200).redirect('/loginpage');
    } catch (error) {
        console.error('Verification error:', error);
        res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
};


// Login
exports.login = [
    body('email').isEmail().normalizeEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            await rateLimiter.consume(req.ip); // Consume 1 point per attempt

            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            if (!user.emailVerified) {
                return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
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
