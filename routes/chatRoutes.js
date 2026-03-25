const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../services/cloudinaryService');

router.post('/initiate', chatController.initiateChat);
router.post('/upload-audio', upload.single('audio'), chatController.uploadAudio);
router.get('/history/:chatId', chatController.getChatHistory);
router.get('/admin/all', protect, authorize('admin', 'superadmin', 'technical_support'), chatController.getAllChats);
router.put('/admin/read/:chatId', protect, authorize('admin', 'superadmin', 'technical_support'), chatController.markAsRead);
router.put('/close/:chatId', chatController.closeChat);

module.exports = router;
