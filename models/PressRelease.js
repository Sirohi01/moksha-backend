const mongoose = require('mongoose');

const pressReleaseSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  subtitle: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Content
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: String,
  
  // Media
  featuredImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  },
  mediaAssets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  }],
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['announcement', 'event', 'achievement', 'partnership', 'campaign', 'emergency', 'other']
  },
  tags: [String],
  
  // Publishing
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledFor: Date,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Contact Info
  contactPerson: {
    name: String,
    email: String,
    phone: String,
    designation: String
  },
  
  // Distribution
  distributionList: [{
    outlet: String,
    contact: String,
    email: String,
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'opened', 'published'],
      default: 'pending'
    }
  }],
  
  // Analytics
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  coverage: [{
    outlet: String,
    url: String,
    publishedAt: Date,
    reach: Number,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  }],
  
  // System Fields
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected'],
    default: 'draft'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  revisionHistory: [{
    version: Number,
    changes: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate slug before saving
pressReleaseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
pressReleaseSchema.index({ status: 1, publishedAt: -1 });
pressReleaseSchema.index({ category: 1 });
pressReleaseSchema.index({ tags: 1 });
pressReleaseSchema.index({ slug: 1 });

// Virtual for reading time
pressReleaseSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Method to increment views
pressReleaseSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model('PressRelease', pressReleaseSchema);