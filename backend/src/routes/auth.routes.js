   // backend/src/routes/auth.routes.js
   const express = require('express');
   const router = express.Router();
   const path = require('path');
   const authController = require('../controllers/auth.controller');


   router.post('/register', authController.register);
   router.post('/login', authController.login);
   router.get('/verify-email', authController.verifyEmail);



   module.exports = router;