const mongoose = require('mongoose');

const userSegmentSchema = new mongoose.Schema({
  name: {
    type: String, // e.g., 'Active Donors', 'Potential Volunteers'
    required: true,
    unique: true
  },
  description: String,
  filterCriteria: {
    type: mongoose.Schema.Types.Mixed, // e.g., { role: 'donor', lastDonated: { $gt: '...date...' } }
    required: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  lastRefreshedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageSentAt: Date, // When they were last mailed/SMSed
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

userSegmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserSegment', userSegmentSchema);
