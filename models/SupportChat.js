const mongoose = require('mongoose');

const supportChatSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'archived'],
    default: 'active'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: {
      city: String,
      country: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SupportChat', supportChatSchema);
