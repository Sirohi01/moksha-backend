const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');
router.post('/initiate', chatController.initiateChat);
router.get('/history/:chatId', chatController.getChatHistory);
router.get('/admin/all', protect, authorize('admin', 'superadmin', 'technical_support'), chatController.getAllChats);
router.put('/admin/read/:chatId', protect, authorize('admin', 'superadmin', 'technical_support'), chatController.markAsRead);
router.put('/close/:chatId', chatController.closeChat);

module.exports = router;
