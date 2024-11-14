const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favourite.controller');

router.post('/toggle', favouriteController.toggleFavourite);

// Route to add a favorite
router.post('/add', favouriteController.addFavourite);

// Route to get all favorites of a specific user by their userId
router.get('/:userId', favouriteController.getFavouritesByUserId);

// Route to remove a favorite by its unique id
router.delete('/remove/:id', favouriteController.removeFavourite);

module.exports = router;
