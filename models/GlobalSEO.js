const mongoose = require('mongoose');

const globalSEOSchema = new mongoose.Schema({
  headerScripts: {
    type: String,
    default: ''
  },
  footerScripts: {
    type: String,
    default: ''
  },
  robotsTxt: {
    type: String,
    default: 'User-agent: *\nAllow: /'
  },
  sitemapUrl: {
    type: String,
    default: '/sitemap.xml'
  },
  verificationTags: [{
    name: String,
    content: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: String,
    default: 'Admin'
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSEO', globalSEOSchema);
