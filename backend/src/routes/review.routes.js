const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// POST route for adding reviews
router.post('/addreview', reviewController.addReview);



module.exports = router;
