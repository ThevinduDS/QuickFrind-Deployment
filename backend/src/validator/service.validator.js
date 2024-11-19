const { body } = require('express-validator');

const validateService = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('priceType').isIn(['fixed', 'hourly']).withMessage('Invalid price type'),
    body('location').notEmpty().withMessage('Location is required'),
    body('serviceArea').notEmpty().withMessage('Service area is required'),
    body('availableDays')
        .custom(value => {
            try {
                const parsedValue = JSON.parse(value);
                return Array.isArray(parsedValue);
            } catch (e) {
                throw new Error('Available days must be a valid JSON array');
            }
        })
        .withMessage('Invalid available days format'),
    body('workingHoursStart').notEmpty().withMessage('Working hours Start are required'),
    body('workingHoursEnd').notEmpty().withMessage('Working hours are end required'),
    // body('contactNumber').isMobilePhone().withMessage('Invalid contact number'),
    // body('contactEmail').isEmail().withMessage('Invalid email address'),
    body('categoryId').isInt({ gt: 0 }).withMessage('Category ID must be a positive integer'),
];

module.exports = validateService;
