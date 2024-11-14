// routes/profile.routes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/viewProfile.controller');

// Route to get service profile info and initial reviews
router.get('/:serviceId', profileController.getProfileInfo);

// Route to load more reviews
router.get('/:serviceId/moreReviews', profileController.getMoreReviews);

module.exports = router;
