const mongoose = require('mongoose');

const seoPageSchema = new mongoose.Schema({
  // Page Information
  title: {
    type: String,
    required: [true, 'Page title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Page slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  url: {
    type: String,
    required: [true, 'Page URL is required'],
    trim: true
  },
  
  // SEO Meta Tags
  metaTitle: {
    type: String,
    required: [true, 'Meta title is required'],
    maxlength: [150, 'Meta title is too long'],
    trim: true
  },
  metaDescription: {
    type: String,
    required: [true, 'Meta description is required'],
    maxlength: [500, 'Meta description is too long'],
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  
  // Open Graph Tags
  ogTitle: {
    type: String,
    trim: true
  },
  ogDescription: {
    type: String,
    trim: true
  },
  ogImage: {
    type: String,
    trim: true
  },
  ogType: {
    type: String,
    default: 'website',
    enum: ['website', 'article', 'product', 'profile']
  },
  
  // Twitter Card Tags
  twitterCard: {
    type: String,
    default: 'summary_large_image',
    enum: ['summary', 'summary_large_image', 'app', 'player']
  },
  twitterTitle: {
    type: String,
    trim: true
  },
  twitterDescription: {
    type: String,
    trim: true
  },
  twitterImage: {
    type: String,
    trim: true
  },
  
  // Schema Markup
  schemaType: {
    type: String,
    enum: ['WebPage', 'Article', 'Organization', 'LocalBusiness', 'Product', 'Event', 'FAQ'],
    default: 'WebPage'
  },
  schemaMarkup: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Technical SEO
  canonicalUrl: {
    type: String,
    trim: true
  },
  robots: {
    type: String,
    default: 'index, follow',
    enum: ['index, follow', 'noindex, follow', 'index, nofollow', 'noindex, nofollow']
  },
  hreflang: [{
    lang: String,
    url: String
  }],
  h1Tag: {
    type: String,
    trim: true
  },
  breadcrumb: {
    type: String,
    trim: true
  },
  internalLinks: {
    type: String,
    trim: true
  },
  
  // Analytics and Scripts
  gtmCode: {
    type: String,
    trim: true
  },
  analyticsCode: {
    type: String,
    trim: true
  },
  headCode: {
    type: String,
    trim: true
  },
  bodyCode: {
    type: String,
    trim: true
  },
  
  // Image SEO
  imageAltMappings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Content Information
  content: {
    type: String,
    trim: true
  },
  contentType: {
    type: String,
    enum: ['page', 'blog', 'service', 'product', 'about', 'contact'],
    default: 'page'
  },
  wordCount: {
    type: Number,
    default: 0
  },
  
  // SEO Performance
  targetKeywords: [{
    keyword: String,
    difficulty: {
      type: Number,
      min: 1,
      max: 100
    },
    searchVolume: Number,
    currentRank: Number,
    targetRank: Number
  }],
  
  // Analytics Data
  pageViews: {
    type: Number,
    default: 0
  },
  organicTraffic: {
    type: Number,
    default: 0
  },
  bounceRate: {
    type: Number,
    default: 0
  },
  avgTimeOnPage: {
    type: Number,
    default: 0
  },
  
  // Core Web Vitals
  coreWebVitals: {
    lcp: Number, // Largest Contentful Paint
    fid: Number, // First Input Delay
    cls: Number, // Cumulative Layout Shift
    fcp: Number, // First Contentful Paint
    ttfb: Number // Time to First Byte
  },
  
  // SEO Score
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  seoIssues: [{
    type: {
      type: String,
      enum: ['error', 'warning', 'info']
    },
    message: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    fixed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Status and Management
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under_review'],
    default: 'draft'
  },
  publishedAt: Date,
  lastOptimized: Date,
  
  // Audit Information
  lastAuditDate: Date,
  auditResults: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Management
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Notes and Comments
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
seoPageSchema.index({ slug: 1 });
seoPageSchema.index({ url: 1 });
seoPageSchema.index({ status: 1 });
seoPageSchema.index({ seoScore: -1 });
seoPageSchema.index({ lastOptimized: -1 });
seoPageSchema.index({ 'targetKeywords.keyword': 1 });

// Pre-save middleware to calculate word count
seoPageSchema.pre('save', function(next) {
  if (this.content) {
    this.wordCount = this.content.split(/\s+/).length;
  }
  next();
});

// Method to calculate SEO score
seoPageSchema.methods.calculateSEOScore = function() {
  let score = 0;
  
  // Meta title (20 points)
  if (this.metaTitle && this.metaTitle.length >= 30 && this.metaTitle.length <= 60) {
    score += 20;
  } else if (this.metaTitle) {
    score += 10;
  }
  
  // Meta description (20 points)
  if (this.metaDescription && this.metaDescription.length >= 120 && this.metaDescription.length <= 160) {
    score += 20;
  } else if (this.metaDescription) {
    score += 10;
  }
  
  // Content length (15 points)
  if (this.wordCount >= 300) {
    score += 15;
  } else if (this.wordCount >= 150) {
    score += 8;
  }
  
  // Keywords (15 points)
  if (this.targetKeywords && this.targetKeywords.length > 0) {
    score += 15;
  }
  
  // Open Graph tags (10 points)
  if (this.ogTitle && this.ogDescription && this.ogImage) {
    score += 10;
  }
  
  // Schema markup (10 points)
  if (this.schemaMarkup) {
    score += 10;
  }
  
  // Canonical URL (5 points)
  if (this.canonicalUrl) {
    score += 5;
  }
  
  // Core Web Vitals (5 points)
  if (this.coreWebVitals && this.coreWebVitals.lcp && this.coreWebVitals.fid && this.coreWebVitals.cls) {
    score += 5;
  }
  
  this.seoScore = Math.min(score, 100);
  return this.seoScore;
};

module.exports = mongoose.model('SEOPage', seoPageSchema);