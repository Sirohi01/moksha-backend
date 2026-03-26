const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  utmSource: {
    type: String, // facebook, google, instagram
    required: true,
    index: true
  },
  utmMedium: {
    type: String, // social, email, ppc
    required: true
  },
  utmCampaign: {
    type: String, // summer_campaign, donation_drive
    required: true,
    index: true
  },
  description: String,
  totalClicks: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: Date,
  endDate: Date,
  redirectUrl: {
    type: String,
    required: true // Original link (e.g., homepage or specific donation page)
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

marketingCampaignSchema.index({ createdAt: -1 });
marketingCampaignSchema.index({ utmCampaign: 1, utmSource: 1, utmMedium: 1 });

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);
