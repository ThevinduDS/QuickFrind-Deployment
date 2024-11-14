// routes/offering.routes.js
const express = require('express');
const router = express.Router();
const { getServicesByCategory, createOffering } = require('../controllers/offering.controller');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/create', upload.array('offeringImages', 10), createOffering); 

module.exports = router;
