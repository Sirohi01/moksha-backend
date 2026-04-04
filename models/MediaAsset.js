const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: String,
  type: {
    type: String,
    required: [true, 'Media type is required'],
    enum: ['image', 'video', 'document', 'audio', 'logo', 'brand_asset']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['gallery', 'press', 'social', 'brand', 'events', 'campaigns', 'testimonials', 'other', 'services', 'community', 'volunteers', 'compliance', 'content_assets', 'general', 'blog', 'documentary', 'whatsapp']
  },

  // File Details
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: String,
  mimeType: String,
  fileSize: Number, // in bytes
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number, // for videos/audio in seconds

  // URLs
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: String,
  cloudinaryId: String,

  // SEO & Metadata
  altText: {
    type: String,
    required: [function() { return this.type === 'image'; }, 'Alt text is required for image SEO compliance']
  },
  caption: String,
  tags: [String],
  keywords: [String],
  
  // Social Media
  socialPlatforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube']
    },
    postId: String,
    postUrl: String,
    postedAt: Date,
    engagement: {
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 }
    }
  }],

  // Usage & Analytics
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  lastAccessed: Date,
  
  // Approval Workflow
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  approvalHistory: [{
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'revision_requested']
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    comment: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // System Fields
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiresAt: Date,
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  parentAsset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MediaAsset'
  },
  versions: [{
    version: Number,
    url: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    changes: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
mediaAssetSchema.index({ type: 1, category: 1 });
mediaAssetSchema.index({ status: 1 });
mediaAssetSchema.index({ uploadedBy: 1 });
mediaAssetSchema.index({ tags: 1 });
mediaAssetSchema.index({ createdAt: -1 });

// Virtual for file size in human readable format
mediaAssetSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.fileSize) return 'Unknown';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
  return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment download count
mediaAssetSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Method to increment view count
mediaAssetSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);