const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// @route   POST api/chat/ask
// @desc    Ask a question associated with a stat
// @access  Public
router.post('/ask', chatController.askQuestion);

// @route   GET api/chat/history
// @desc    Get conversation history
// @access  Public
router.get('/history', chatController.getHistory);

module.exports = router;
