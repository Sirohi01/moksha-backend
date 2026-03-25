const SupportChat = require('../models/SupportChat');
const SupportMessage = require('../models/SupportMessage');
const asyncHandler = require('express-async-handler');

// @desc    Initiate or get chat session
// @route   POST /api/chat/initiate
// @access  Public
exports.initiateChat = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error('Name, Email and Phone are required');
  }

  // Check if there's an active chat for this email/phone
  let chat = await SupportChat.findOne({ 
    $or: [{ email }, { phone }],
    status: 'active'
  });

  if (!chat) {
    chat = await SupportChat.create({
      userName: name,
      email,
      phone,
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    });

    // Create system welcome message
    await SupportMessage.create({
      chatId: chat._id,
      sender: 'system',
      content: `Welcome ${name}! A support agent will be with you shortly.`
    });
  }

  res.status(200).json({
    success: true,
    data: chat
  });
});

// @desc    Get chat history
// @route   GET /api/chat/history/:chatId
// @access  Public (should probably be session-protected in real world)
exports.getChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await SupportMessage.find({ chatId })
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Get all chats (Admin)
// @route   GET /api/chat/admin/all
// @access  Private/Admin
exports.getAllChats = asyncHandler(async (req, res) => {
  const chats = await SupportChat.find()
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    data: chats
  });
});

// @desc    Mark chat as read (Admin)
// @route   PUT /api/chat/admin/read/:chatId
// @access  Private/Admin
exports.markAsRead = asyncHandler(async (req, res) => {
  await SupportChat.findByIdAndUpdate(req.params.chatId, {
    'unreadCount.admin': 0
  });

  await SupportMessage.updateMany(
    { chatId: req.params.chatId, sender: 'user', read: false },
    { read: true, readAt: new Date() }
  );

  res.status(200).json({ success: true });
});

// @desc    Close chat session
// @route   PUT /api/chat/close/:chatId
// @access  Public/Admin
exports.closeChat = asyncHandler(async (req, res) => {
  await SupportChat.findByIdAndUpdate(req.params.chatId, {
    status: 'closed'
  });

  res.status(200).json({ success: true, message: 'Chat closed' });
});
