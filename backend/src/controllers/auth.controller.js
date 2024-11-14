// backend/src/controllers/auth.controller.js
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body;

        // Log the incoming request body for debugging
        console.log('Registration request body:', req.body);

        // Check if the user already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or phone already exists'
            });
        }

        // Create a new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password: await bcrypt.hash(password, 10),
            role: role || 'customer'
        });

        // Generate a JWT token using config
        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        // Respond with success
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error registering user' 
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Generate a JWT token using config
        const token = jwt.sign(
            { id: user.id, role: user.role },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error during login' 
        });
    }
};