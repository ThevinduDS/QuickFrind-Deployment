   // backend/src/routes/auth.routes.js
   const express = require('express');
   const router = express.Router();
   const authController = require('../controllers/auth.controller');

   router.post('/register', authController.register);
   router.post('/login', authController.login);
   router.get('/verify-email', authController.verifyEmail);
   router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

   module.exports = router;