const express = require('express');
const router = express.Router();
const userController = require('../controllers/userProfile.controller');
const { updateUserProfilePhoto } = require('../controllers/userProfile.controller');
const multer = require('multer');
// Route to get user profile by ID
router.get('/:id', userController.getUserProfile);

const profiles = multer({ dest: 'profileImg/' });

router.patch('/create', profiles.array('profileImg', 1), updateUserProfilePhoto); 

module.exports = router;
