//This is my massage.routes.js file

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/massage.controller'); // Ensure the path is correct

router.get('/service-providers', messageController.getServiceProviders);
router.get('/conversations/:userId', messageController.getConversations);
router.get('/conversations/:userId/:receiverId', messageController.getMessagesBetweenUsers);
router.post('/send', messageController.sendMessage);

module.exports = router;
