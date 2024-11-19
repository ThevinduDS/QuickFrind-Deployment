//this is service route 

const express = require('express');
const router = express.Router();
const { addService } = require('../controllers/service.controller'); // Controller for adding services
const serviceUpload = require('../middleware/upload.middleware'); // Corrected middleware import
const validateService = require('../validator/service.validator'); // Validation middleware for service fields
const authenticate = require('../middleware/auth.middleware'); // Authentication middleware

// Route for adding a new service
router.post(
    '/add',
    authenticate, // Ensure user is authenticated
    (req, res, next) => {
        serviceUpload(req, res, (err) => { 
            // Handle Multer errors
            if (err) {
                return res.status(400).json({
                    message: err.message || 'Error during file upload',
                });
            }
            next();
        });
    },
    validateService, // Validate service fields after file upload
    async (req, res) => {
        try {
            await addService(req, res); // Handle service addition
        } catch (err) {
            console.error('Error adding service:', err.message);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

module.exports = router;
