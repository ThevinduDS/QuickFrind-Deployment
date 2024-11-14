const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Route to get a list of categories with a limit of 4
router.get('/', categoryController.getCategories);

// Route to fetch services by category ID for search
router.get('/:categoryId/services', categoryController.getServicesByCategory);

module.exports = router;
