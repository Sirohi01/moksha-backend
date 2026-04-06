const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['sms', 'whatsapp', 'push', 'system', 'broadcast', 'alert']
  },
  recipient: {
    type: String, // phone number or internal identifier
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered', 'read'],
    default: 'pending'
  },
  provider: {
    type: String, // Twilio, WhatsApp API, etc.
    enum: ['Twilio', 'WhatsAppCloudAPI', 'InternalSystem']
  },
  providerMessageId: {
    type: String,
    index: true
  },
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

communicationLogSchema.index({ createdAt: -1 });
communicationLogSchema.index({ type: 1, status: 1 });
// Expire after 180 days (6 months retention for business logs)
communicationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
