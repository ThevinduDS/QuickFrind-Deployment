// backend/src/controllers/auth.controller.js
const { body, validationResult } = require('express-validator');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const rateLimiter = require('../config/rateLimiter');

// Common validation and sanitization rules
const userValidationRules = [
    body('firstName').trim().escape().isLength({ min: 4 }).withMessage('First name required.'),
    body('lastName').trim().escape().isLength({ min: 6 }).withMessage('Last name required.'),
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email.'),
    body('phone').matches(/^(0?77|0?76|0?74|0?71|0?72|0?75)\d{6,7}$/ ).withMessage('Invalid Sri Lankan phone number.'),
    body('password').isLength({ min: 8 }).withMessage('Password must beb at least 8 characters long.'),
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

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const user = await User.create({
                firstName,
                lastName,
                email,
                phone,
                password: await bcrypt.hash(password, 10),
                role: role || 'customer',
            });

            const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, { expiresIn: '24h' });

            res.status(201).json({ success: true, token, user: { id: user.id, firstName, lastName, email, role } });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: 'Error registering user' });
        }
    },
];

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
            await rateLimiter.consume(req.ip);  // Consume 1 point per attempt

            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret, { expiresIn: '24h' });
            res.json({ success: true, token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email, role: user.role } });
        } catch (rateLimiterError) {
            res.status(429).json({ success: false, message: 'Too many login attempts. Try again later.' });
        } 
        // catch (error) {
        //     console.error('Login error:', error);
        //     res.status(500).json({ success: false, message: 'Error during login' });
        // }
    },
];
