const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const passport = require('passport');

// Local Authentication Routes
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
        const redirectUrl = `http://127.0.0.1:5500/frontend/pages/auth/index.html?token=${token}`;
        res.redirect(redirectUrl);
    }
);


router.get('/logout', authController.logout);

module.exports = router;
