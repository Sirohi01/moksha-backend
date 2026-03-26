const mongoose = require('mongoose');

const publicInteractionSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: [
      'linkedin', 'whatsapp', 'twitter', 'instagram', 'youtube', 'facebook', 
      'call', 'report', 'support', 'gallery', 'x', 'x (twitter)', 'twitter', 
      'mail', 'email', 'phone'
    ]
  },
  ipAddress: {
    type: String,
    index: true
  },
  location: {
    city: String,
    region: String,
    country: String
  },
  userAgent: String,
  pageUrl: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

publicInteractionSchema.index({ platform: 1, createdAt: -1 });
publicInteractionSchema.index({ createdAt: -1 });
// Retention for 90 days
publicInteractionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('PublicInteraction', publicInteractionSchema);
