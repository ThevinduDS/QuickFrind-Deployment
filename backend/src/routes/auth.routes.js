// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);

// Google OAuth Routes
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'], // Requested permissions
}));

// Handle Google OAuth callback
router.get('/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const { token } = req.user;
        const redirectUrl = `/home?token=${token}`;
        res.redirect(redirectUrl);
    }
);


router.get('/logout', authController.logout);

module.exports = router;