// routes/api/categories.routes.js
const express = require('express');
const router = express.Router();
const Category  = require('../models/category.model');

// Fetch all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'], // Limit to necessary fields
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
