const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipientEmail: {
    type: String,
    required: true,
    index: true
  },
  recipientName: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  templateName: {
    type: String
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  },
  errorMessage: {
    type: String
  },
  messageId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});
emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ recipientEmail: 1, createdAt: -1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
