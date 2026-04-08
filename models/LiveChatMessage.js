const mongoose = require('mongoose');

const liveChatMessageSchema = new mongoose.Schema({
  streamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveStream',
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'guest']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index to improve fetching chat for a specific stream
liveChatMessageSchema.index({ streamId: 1, createdAt: 1 });

module.exports = mongoose.model('LiveChatMessage', liveChatMessageSchema);
