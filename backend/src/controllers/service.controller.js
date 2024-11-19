const Service = require('../models/service.model');
const ServiceImage = require('../models/serviceImage.model');
const { validationResult } = require('express-validator');

// Add New Service
exports.addService = async (req, res) => {
    // Log incoming request body
    console.log('Request Body:', req.body);

    // Handle validation errors
    const errors = validationResult(req);
    // console.log('Validation Errors:', errors);
    
    if (!errors.isEmpty()) {
        console.log('Validation failed:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Destructure required fields from request body
        const { 
            title, 
            description, 
            price, 
            priceType, 
            location, 
            serviceArea, 
            availableDays, 
            workingHours, 
            contactNumber, 
            contactEmail, 
            categoryId 
        } = req.body;

        // Parse availableDays into an array if it's a string
        const parsedAvailableDays = Array.isArray(availableDays)
            ? availableDays
            : JSON.parse(availableDays);

        // Create a new service entry
        const newService = await Service.create({
            title,
            description,
            price,
            priceType,
            location,
            serviceArea,
            availableDays: parsedAvailableDays,
            workingHours,
            contactNumber,
            contactEmail,
            providerId: req.user.id, // Assuming user ID comes from authentication middleware
            categoryId,
        });
        console.log('Service created:', newService);


        // Handle uploaded images
        if (req.files && req.files['serviceImages'] && req.files['serviceImages'].length > 0) {
            const imagePromises = req.files['serviceImages'].map(file =>
                ServiceImage.create({
                    imageUrl: file.path, // File path stored by multer
                    serviceId: newService.id,
                })
            );
            await Promise.all(imagePromises);
        } else {
            console.log('No serviceImages found in req.files');
        }

        // Send success response
        console.log('Sending success response...');
        return res.status(201).json({ message: 'Service added successfully', service: newService });
        
    } catch (error) {
        console.error('Error adding service:', error);
        return res.status(500).json({ error: 'Failed to add service' });
    }
};
