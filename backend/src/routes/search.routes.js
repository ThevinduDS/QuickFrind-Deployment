// routes/routes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/search.controller');

// Search for services
router.get('/search', serviceController.searchServices);
router.get('/services/:id', serviceController.getServiceById);

module.exports = router;
