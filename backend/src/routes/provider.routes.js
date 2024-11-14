// backend/src/routes/provider.routes.js
const express = require('express');
const router = express.Router();
const providerController = require('../controllers/provider.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/stats', authMiddleware, providerController.getStats);
router.get('/services', authMiddleware, providerController.getServices);
router.post('/services', authMiddleware, providerController.createService);
router.put('/services/:id', authMiddleware, providerController.updateService);
router.delete('/services/:id', authMiddleware, providerController.deleteService);

module.exports = router;