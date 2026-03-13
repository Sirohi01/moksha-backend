const mongoose = require('mongoose');

const socialMediaPostSchema = new mongoose.Schema({
  // Basic Info
  title: String,
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  
  // Platform Specific Content
  platforms: [{
    platform: {
      type: String,
      required: true,
      enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube']
    },
    content: String, // Platform-specific content if different
    hashtags: [String],
    mentions: [String],
    
    // Platform specific fields
    twitterThread: [String], // For Twitter threads
    instagramStory: Boolean, // If it's an Instagram story
    linkedinArticle: Boolean, // If it's a LinkedIn article
    
    // Posting details
    postId: String,
    postUrl: String,
    postedAt: Date,
    
    // Engagement metrics
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'posted', 'failed'],
      default: 'draft'
    },
    errorMessage: String
  }],
  
  // Media Assets
  mediaAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }],
  
  // Scheduling
  scheduledFor: Date,
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  
  // Categorization
  category: {
    type: String,
    enum: ['announcement', 'event', 'campaign', 'testimonial', 'educational', 'behind_scenes', 'other'],
    default: 'other'
  },
  tags: [String],
  
  // Campaign Association
  campaign: {
    name: String,
    id: String
  },
  
  // Approval Workflow
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'scheduled', 'posted', 'archived'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Analytics
  totalEngagement: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  
  // System Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Auto-posting settings
  autoPost: {
    type: Boolean,
    default: false
  },
  crossPost: {
    type: Boolean,
    default: false
  },
  
  // Performance tracking
  performanceScore: Number, // 1-100 based on engagement
  bestPerformingPlatform: String,
  
  // Notes and comments
  notes: String,
  internalComments: [{
    comment: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
socialMediaPostSchema.index({ status: 1, scheduledFor: 1 });
socialMediaPostSchema.index({ 'platforms.platform': 1 });
socialMediaPostSchema.index({ category: 1 });
socialMediaPostSchema.index({ createdBy: 1 });
socialMediaPostSchema.index({ createdAt: -1 });

// Virtual for total platforms
socialMediaPostSchema.virtual('platformCount').get(function() {
  return this.platforms.length;
});

// Method to calculate engagement rate
socialMediaPostSchema.methods.calculateEngagementRate = function() {
  let totalEngagement = 0;
  let totalReach = 0;
  
  this.platforms.forEach(platform => {
    totalEngagement += (platform.likes + platform.shares + platform.comments);
    totalReach += platform.views || 0;
  });
  
  this.totalEngagement = totalEngagement;
  this.engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
  
  return this.save();
};

// Method to update platform metrics
socialMediaPostSchema.methods.updatePlatformMetrics = function(platform, metrics) {
  const platformData = this.platforms.find(p => p.platform === platform);
  if (platformData) {
    Object.assign(platformData, metrics);
    return this.save();
  }
  return Promise.reject(new Error('Platform not found'));
};

module.exports = mongoose.model('SocialMediaPost', socialMediaPostSchema);