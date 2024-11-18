const express = require('express');
const router = express.Router();
const path = require('path');


// Serve index.html for customers
router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/pages/index.html'));
});

// Serve login.html
router.get('/loginpage', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/pages/auth/login.html'));
});



module.exports = router;