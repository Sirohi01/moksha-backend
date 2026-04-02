const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Content slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },

  // Content Details
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt should not exceed 300 characters'],
    trim: true
  },

  // Content Type and Category
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: ['page', 'blog', 'news', 'service', 'about', 'faq', 'testimonial', 'case_study', 'page_config', 'documentary', 'press'],
    default: 'page'
  },
  category: {
    type: String,
    enum: [
      'general', 'services', 'about', 'news', 'resources', 
      'help', 'configuration', 'official', 'mission', 
      'impact', 'legislative', 'behind-the-scenes',
      'media-kit', 'statutory', 'mission-log', 'clarification'
    ],
    default: 'general'
  },

  // Media
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  youtubeUrl: String,
  reelUrl: String,
  gallery: [{
    url: String,
    alt: String,
    caption: String
  }],

  seoRanking: {
    targetKeywords: [String],
    currentRank: Number,
    competitorKeywords: [String],
    searchVolume: Number,
    rankingDifficulty: Number
  },

  seoTechnical: {
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    twitterCard: { type: String, default: 'summary_large_image' },
    schemaMarkup: mongoose.Schema.Types.Mixed,
    canonicalUrl: String,
    robots: { type: String, default: 'index, follow' },
    h1Tag: String,
    breadcrumb: String,
    redirectionUrl: String
  },

  // Basic Meta (Search Ranking Primary)
  metaTitle: {
    type: String,
    maxlength: [200, 'Meta title should not exceed 200 characters'],
    trim: true
  },
  metaDescription: {
    type: String,
    maxlength: [500, 'Meta description should not exceed 500 characters'],
    trim: true
  },
  focusKeyword: {
    type: String,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],

  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived', 'under_review'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledAt: Date,

  // Author and Management
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },

  // Content Structure
  sections: [{
    title: String,
    content: String,
    order: Number,
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'gallery', 'cta', 'testimonial', 'faq'],
      default: 'text'
    }
  }],

  // Template and Layout
  template: {
    type: String,
    enum: ['default', 'landing', 'service', 'about', 'contact', 'blog', 'news'],
    default: 'default'
  },
  layout: {
    type: String,
    enum: ['full_width', 'sidebar_left', 'sidebar_right', 'two_column'],
    default: 'full_width'
  },

  // Engagement
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },

  // Comments (if enabled)
  commentsEnabled: {
    type: Boolean,
    default: false
  },
  comments: [{
    name: String,
    email: String,
    comment: String,
    approved: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Versioning
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    content: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    changeLog: String
  }],

  // Localization
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'bn', 'or']
  },
  translations: [{
    language: String,
    title: String,
    content: String,
    slug: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'needs_update'],
      default: 'draft'
    }
  }],

  // Analytics and Performance
  analytics: {
    pageViews: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    avgTimeOnPage: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },

  // Content Quality
  readabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },

  // Workflow
  workflow: {
    currentStage: {
      type: String,
      enum: ['draft', 'review', 'approved', 'published'],
      default: 'draft'
    },
    reviewers: [{
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      comments: String,
      reviewedAt: Date
    }],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    approvedAt: Date
  },

  // Tags and Taxonomy
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: mongoose.Schema.Types.Mixed
  },

  // Notes and Comments
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
contentSchema.index({ slug: 1 });
contentSchema.index({ type: 1, status: 1 });
contentSchema.index({ author: 1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ 'workflow.currentStage': 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ language: 1 });

// Pre-save middleware
contentSchema.pre('save', function (next) {
  // Calculate word count
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
    // Calculate reading time (average 200 words per minute)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }

  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Auto-generate meta title if not provided
  if (!this.metaTitle && this.title) {
    this.metaTitle = this.title.length > 60 ? this.title.substring(0, 57) + '...' : this.title;
  }

  // Auto-generate meta description from excerpt or content
  if (!this.metaDescription) {
    const source = this.excerpt || this.content;
    if (source) {
      const plainText = source.replace(/<[^>]*>/g, ''); // Remove HTML tags
      this.metaDescription = plainText.length > 160 ? plainText.substring(0, 157) + '...' : plainText;
    }
  }

  next();
});

// Method to publish content
contentSchema.methods.publish = function () {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

// Method to archive content
contentSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

// Method to create new version
contentSchema.methods.createVersion = function (changeLog) {
  this.previousVersions.push({
    version: this.version,
    content: this.content,
    modifiedBy: this.lastEditedBy,
    changeLog: changeLog
  });
  this.version += 1;
  return this.save();
};

module.exports = mongoose.model('Content', contentSchema);