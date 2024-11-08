const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, chatController.getChats);
router.post('/', authenticate, chatController.sendMessage);

module.exports = router;