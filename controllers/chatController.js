const SupportChat = require('../models/SupportChat');
const SupportMessage = require('../models/SupportMessage');
const asyncHandler = require('express-async-handler');
const { uploadToCloudinary } = require('../services/cloudinaryService');
exports.uploadAudio = asyncHandler(async (req, res) => {
  const { chatId, sender, adminId } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('No audio file provided');
  }
  const result = await uploadToCloudinary(req.file, 'chat/audio');
  const newMessage = await SupportMessage.create({
    chatId,
    sender,
    adminId: sender === 'admin' ? adminId : null,
    content: result.url,
    type: 'audio'
  });
  await SupportChat.findByIdAndUpdate(chatId, { lastMessageAt: new Date() });

  res.status(200).json({
    success: true,
    data: newMessage
  });
});
exports.initiateChat = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error('Name, Email and Phone are required');
  }
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
exports.getChatHistory = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const messages = await SupportMessage.find({ chatId })
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    data: messages
  });
});
exports.getAllChats = asyncHandler(async (req, res) => {
  const chats = await SupportChat.find()
    .sort({ lastMessageAt: -1 });

  res.status(200).json({
    success: true,
    data: chats
  });
});
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

exports.closeChat = asyncHandler(async (req, res) => {
  await SupportChat.findByIdAndUpdate(req.params.chatId, {
    status: 'closed'
  });

  res.status(200).json({ success: true, message: 'Chat closed' });
});
