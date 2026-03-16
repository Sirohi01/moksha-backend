const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SEOPage = require('./models/SEOPage');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB Connected for SEO check');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Check all SEO pages
const checkAllSEOPages = async () => {
  try {
    console.log('🔍 Checking all SEO pages...\n');

    const seoPages = await SEOPage.find({}).sort({ seoScore: -1 });
    
    console.log(`📊 Total SEO Pages: ${seoPages.length}\n`);
    
    console.log('📋 SEO Pages List:');
    console.log('='.repeat(80));
    console.log('Page Name'.padEnd(20) + 'Score'.padEnd(8) + 'Status'.padEnd(12) + 'Priority'.padEnd(10) + 'Meta Title');
    console.log('='.repeat(80));
    
    seoPages.forEach(page => {
      const name = page.slug.padEnd(20);
      const score = `${page.seoScore}/100`.padEnd(8);
      const status = page.status.padEnd(12);
      const priority = page.priority.padEnd(10);
      const title = page.metaTitle.substring(0, 40) + (page.metaTitle.length > 40 ? '...' : '');
      
      console.log(`${name}${score}${status}${priority}${title}`);
    });
    
    console.log('='.repeat(80));
    
    // Statistics
    const stats = {
      total: seoPages.length,
      published: seoPages.filter(p => p.status === 'published').length,
      draft: seoPages.filter(p => p.status === 'draft').length,
      avgScore: Math.round(seoPages.reduce((sum, p) => sum + p.seoScore, 0) / seoPages.length),
      highScore: Math.max(...seoPages.map(p => p.seoScore)),
      lowScore: Math.min(...seoPages.map(p => p.seoScore)),
      urgent: seoPages.filter(p => p.priority === 'urgent').length,
      high: seoPages.filter(p => p.priority === 'high').length,
      medium: seoPages.filter(p => p.priority === 'medium').length,
      low: seoPages.filter(p => p.priority === 'low').length
    };
    
    console.log('\n📈 SEO Statistics:');
    console.log(`📄 Total Pages: ${stats.total}`);
    console.log(`✅ Published: ${stats.published}`);
    console.log(`📝 Draft: ${stats.draft}`);
    console.log(`📊 Average Score: ${stats.avgScore}/100`);
    console.log(`🏆 Highest Score: ${stats.highScore}/100`);
    console.log(`📉 Lowest Score: ${stats.lowScore}/100`);
    console.log(`🚨 Urgent: ${stats.urgent} | 🔥 High: ${stats.high} | 📋 Medium: ${stats.medium} | 📌 Low: ${stats.low}`);
    
    // Top performing pages
    console.log('\n🏆 Top 5 SEO Pages:');
    seoPages.slice(0, 5).forEach((page, index) => {
      console.log(`${index + 1}. ${page.slug} (${page.seoScore}/100) - ${page.metaTitle}`);
    });
    
    // Pages needing attention
    const lowScorePages = seoPages.filter(p => p.seoScore < 50);
    if (lowScorePages.length > 0) {
      console.log('\n⚠️ Pages Needing SEO Attention (Score < 50):');
      lowScorePages.forEach(page => {
        console.log(`- ${page.slug} (${page.seoScore}/100) - ${page.metaTitle}`);
      });
    }
    
    console.log('\n✅ SEO check completed!');
    
  } catch (error) {
    console.error('❌ SEO check failed:', error);
  }
};

// Run check if called directly
if (require.main === module) {
  connectDB().then(async () => {
    await checkAllSEOPages();
    process.exit(0);
  });
}

module.exports = checkAllSEOPages;