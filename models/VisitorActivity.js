const mongoose = require('mongoose');

const visitorActivitySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: String,
  path: {
    type: String,
    required: true
  },
  referer: String,
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // duration in seconds
    default: 0
  },
  events: [{
    type: {
      type: String, // 'click', 'scroll', etc.
      enum: ['click', 'scroll', 'form_submit', 'page_view'],
      default: 'click'
    },
    targetId: String,
    targetText: String,
    targetClass: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    pageUrl: String
  }],
  location: {
    city: String,
    region: String,
    country: String
  },
  isNewSession: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
visitorActivitySchema.index({ createdAt: -1 });
visitorActivitySchema.index({ ipAddress: 1, createdAt: -1 });
visitorActivitySchema.index({ sessionId: 1, createdAt: -1 });

// TTL index to automatically delete old logs after 30 days to keep DB clean
visitorActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('VisitorActivity', visitorActivitySchema);
