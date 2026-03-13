const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Page/Content Reference
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'pageType'
  },
  pageType: {
    type: String,
    enum: ['SEOPage', 'Content'],
    required: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  
  // Date and Time
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  hour: {
    type: Number,
    min: 0,
    max: 23
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  },
  
  // Traffic Data
  pageViews: {
    type: Number,
    default: 0
  },
  uniquePageViews: {
    type: Number,
    default: 0
  },
  sessions: {
    type: Number,
    default: 0
  },
  users: {
    type: Number,
    default: 0
  },
  newUsers: {
    type: Number,
    default: 0
  },
  
  // Engagement Metrics
  avgSessionDuration: {
    type: Number,
    default: 0 // in seconds
  },
  bounceRate: {
    type: Number,
    default: 0 // percentage
  },
  pagesPerSession: {
    type: Number,
    default: 0
  },
  avgTimeOnPage: {
    type: Number,
    default: 0 // in seconds
  },
  
  // Traffic Sources
  organicTraffic: {
    type: Number,
    default: 0
  },
  directTraffic: {
    type: Number,
    default: 0
  },
  referralTraffic: {
    type: Number,
    default: 0
  },
  socialTraffic: {
    type: Number,
    default: 0
  },
  paidTraffic: {
    type: Number,
    default: 0
  },
  emailTraffic: {
    type: Number,
    default: 0
  },
  
  // Search Engine Data
  searchEngines: [{
    engine: {
      type: String,
      enum: ['google', 'bing', 'yahoo', 'duckduckgo', 'other']
    },
    clicks: Number,
    impressions: Number,
    ctr: Number, // Click-through rate
    avgPosition: Number
  }],
  
  // Keywords Data
  keywords: [{
    keyword: String,
    clicks: Number,
    impressions: Number,
    ctr: Number,
    avgPosition: Number,
    difficulty: Number
  }],
  
  // Geographic Data
  countries: [{
    country: String,
    countryCode: String,
    sessions: Number,
    users: Number,
    pageViews: Number
  }],
  cities: [{
    city: String,
    country: String,
    sessions: Number,
    users: Number,
    pageViews: Number
  }],
  
  // Device Data
  devices: [{
    category: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    sessions: Number,
    users: Number,
    pageViews: Number,
    bounceRate: Number
  }],
  
  // Browser Data
  browsers: [{
    browser: String,
    version: String,
    sessions: Number,
    users: Number,
    pageViews: Number
  }],
  
  // Operating System Data
  operatingSystems: [{
    os: String,
    version: String,
    sessions: Number,
    users: Number,
    pageViews: Number
  }],
  
  // Core Web Vitals
  coreWebVitals: {
    lcp: {
      good: Number,
      needsImprovement: Number,
      poor: Number,
      average: Number
    },
    fid: {
      good: Number,
      needsImprovement: Number,
      poor: Number,
      average: Number
    },
    cls: {
      good: Number,
      needsImprovement: Number,
      poor: Number,
      average: Number
    }
  },
  
  // Page Speed Data
  pageSpeed: {
    desktop: {
      score: Number,
      fcp: Number, // First Contentful Paint
      lcp: Number, // Largest Contentful Paint
      fid: Number, // First Input Delay
      cls: Number, // Cumulative Layout Shift
      ttfb: Number // Time to First Byte
    },
    mobile: {
      score: Number,
      fcp: Number,
      lcp: Number,
      fid: Number,
      cls: Number,
      ttfb: Number
    }
  },
  
  // Conversion Data
  conversions: [{
    type: {
      type: String,
      enum: ['form_submission', 'download', 'signup', 'contact', 'donation', 'volunteer']
    },
    count: Number,
    value: Number, // monetary value if applicable
    conversionRate: Number
  }],
  
  // Social Media Data
  socialShares: [{
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp', 'other']
    },
    shares: Number,
    clicks: Number,
    engagement: Number
  }],
  
  // Content Performance
  contentMetrics: {
    scrollDepth: {
      type: Number,
      default: 0 // percentage
    },
    timeToFirstScroll: {
      type: Number,
      default: 0 // in seconds
    },
    clickThroughRate: {
      type: Number,
      default: 0 // percentage
    },
    exitRate: {
      type: Number,
      default: 0 // percentage
    }
  },
  
  // SEO Performance
  seoMetrics: {
    organicKeywords: Number,
    keywordRankings: [{
      keyword: String,
      position: Number,
      previousPosition: Number,
      change: Number,
      searchVolume: Number
    }],
    backlinks: {
      total: Number,
      newLinks: Number,
      lostLinks: Number,
      domainAuthority: Number
    },
    indexedPages: Number,
    crawlErrors: Number
  },
  
  // Goals and Events
  goals: [{
    name: String,
    completions: Number,
    conversionRate: Number,
    value: Number
  }],
  
  events: [{
    category: String,
    action: String,
    label: String,
    count: Number,
    uniqueEvents: Number
  }],
  
  // Data Source
  dataSource: {
    type: String,
    enum: ['google_analytics', 'google_search_console', 'internal', 'third_party'],
    default: 'internal'
  },
  
  // Aggregation Level
  aggregationLevel: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  }
}, {
  timestamps: true
});

// Indexes for performance
analyticsSchema.index({ url: 1, date: -1 });
analyticsSchema.index({ pageId: 1, date: -1 });
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ aggregationLevel: 1, date: -1 });
analyticsSchema.index({ 'keywords.keyword': 1 });
analyticsSchema.index({ dataSource: 1 });

// Compound indexes
analyticsSchema.index({ url: 1, aggregationLevel: 1, date: -1 });
analyticsSchema.index({ pageType: 1, pageId: 1, date: -1 });

// Method to calculate total traffic
analyticsSchema.methods.getTotalTraffic = function() {
  return this.organicTraffic + this.directTraffic + this.referralTraffic + 
         this.socialTraffic + this.paidTraffic + this.emailTraffic;
};

// Method to get top keywords
analyticsSchema.methods.getTopKeywords = function(limit = 10) {
  return this.keywords
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, limit);
};

// Method to calculate conversion rate
analyticsSchema.methods.getConversionRate = function() {
  const totalConversions = this.conversions.reduce((sum, conv) => sum + conv.count, 0);
  return this.sessions > 0 ? (totalConversions / this.sessions) * 100 : 0;
};

// Static method to aggregate data by period
analyticsSchema.statics.aggregateByPeriod = function(startDate, endDate, period = 'daily') {
  const groupBy = {
    daily: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
    weekly: { $dateToString: { format: "%Y-W%U", date: "$date" } },
    monthly: { $dateToString: { format: "%Y-%m", date: "$date" } }
  };
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: groupBy[period],
        totalPageViews: { $sum: "$pageViews" },
        totalUsers: { $sum: "$users" },
        totalSessions: { $sum: "$sessions" },
        avgBounceRate: { $avg: "$bounceRate" },
        avgTimeOnPage: { $avg: "$avgTimeOnPage" },
        totalOrganicTraffic: { $sum: "$organicTraffic" }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Analytics', analyticsSchema);