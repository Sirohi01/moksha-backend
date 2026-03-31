const mongoose = require('mongoose');

const marketingContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['banner', 'popup', 'alert', 'modal']
  },
  title: {
    type: String, // e.g., 'Emergency Donation Drive'
    required: true
  },
  content: {
    type: String, // Mark-down or HTML for the banner/pop-up
    required: true
  },
  imageUrl: String,
  targetUrl: String, // Where the user goes when they click
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  displayRules: {
    page: { 
        type: String, // homepage, all_pages, specific_route
        default: 'homepage'
    },
    frequency: {
        type: String, // once_per_session, always, once_per_user
        default: 'once_per_session'
    },
    priority: {
        type: Number, // Higher number = higher precedence
        default: 0
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  appearance: {
    theme: { type: String, enum: ['navy-gold', 'light', 'dark', 'emergency-red'], default: 'navy-gold' },
    showCloseButton: { type: Boolean, default: true },
    maxWidth: { type: String, default: '450px' }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

marketingContentSchema.index({ createdAt: -1 });
marketingContentSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('MarketingContent', marketingContentSchema);
