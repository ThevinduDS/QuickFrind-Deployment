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
                from:  config.email.from,
                to: user.email,
                subject: 'Verify Your Email Address',
                html: `
                    <h1>Hi ${firstName},</h1>
                    <p>Thank you for registering in QuickFind.LK! Please verify your email address by clicking the link below:</p>
                    <a href="${verificationLink}">Verify Email</a>
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
            return res.status(200).json({ success: true, message: 'Email already verified' });
        }

        user.emailVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully!' });
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
