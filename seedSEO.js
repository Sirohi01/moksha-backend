const mongoose = require('mongoose');
const SEOPage = require('./models/SEOPage');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = require('./config/database');

const sampleSEOPages = [
  {
    title: 'Moksha Seva - Dignified Last Rites Services',
    slug: 'home',
    url: 'https://mokshaseva.org/',
    metaTitle: 'Moksha Seva - Dignified Last Rites & Funeral Services in India',
    metaDescription: 'Providing dignified last rites and funeral services across India. Supporting families during difficult times with compassionate care and proper rituals.',
    metaKeywords: 'moksha seva, last rites, funeral services, dignified funeral, india',
    ogTitle: 'Moksha Seva - Dignified Last Rites Services',
    ogDescription: 'Providing dignified last rites and funeral services across India with compassionate care.',
    ogImage: 'https://mokshaseva.org/images/og-home.jpg',
    twitterTitle: 'Moksha Seva - Dignified Last Rites Services',
    twitterDescription: 'Providing dignified last rites and funeral services across India.',
    canonicalUrl: 'https://mokshaseva.org/',
    contentType: 'page',
    targetKeywords: [
      {
        keyword: 'moksha seva',
        difficulty: 45,
        searchVolume: 2400,
        currentRank: 3,
        targetRank: 1
      },
      {
        keyword: 'last rites services',
        difficulty: 38,
        searchVolume: 1800,
        currentRank: 8,
        targetRank: 5
      },
      {
        keyword: 'funeral services india',
        difficulty: 52,
        searchVolume: 3200,
        currentRank: 12,
        targetRank: 8
      }
    ],
    status: 'published',
    priority: 'high',
    seoScore: 85
  },
  {
    title: 'About Moksha Seva - Our Mission & Vision',
    slug: 'about',
    url: 'https://mokshaseva.org/about',
    metaTitle: 'About Moksha Seva - Our Mission to Provide Dignified Last Rites',
    metaDescription: 'Learn about Moksha Seva\'s mission to provide dignified last rites services. Our vision, values, and commitment to serving families across India.',
    metaKeywords: 'about moksha seva, mission, vision, dignified funeral services',
    ogTitle: 'About Moksha Seva - Our Mission & Vision',
    ogDescription: 'Learn about our mission to provide dignified last rites services across India.',
    canonicalUrl: 'https://mokshaseva.org/about',
    contentType: 'about',
    targetKeywords: [
      {
        keyword: 'about moksha seva',
        difficulty: 25,
        searchVolume: 480,
        currentRank: 2,
        targetRank: 1
      },
      {
        keyword: 'funeral service mission',
        difficulty: 35,
        searchVolume: 720,
        currentRank: 15,
        targetRank: 10
      }
    ],
    status: 'published',
    priority: 'medium',
    seoScore: 78
  },
  {
    title: 'Volunteer with Moksha Seva',
    slug: 'volunteer',
    url: 'https://mokshaseva.org/volunteer',
    metaTitle: 'Volunteer with Moksha Seva - Join Our Noble Cause',
    metaDescription: 'Join Moksha Seva as a volunteer and help provide dignified last rites services. Make a difference in families\' lives during their difficult times.',
    metaKeywords: 'volunteer moksha seva, funeral volunteer, social service volunteer',
    canonicalUrl: 'https://mokshaseva.org/volunteer',
    contentType: 'service',
    targetKeywords: [
      {
        keyword: 'volunteer moksha seva',
        difficulty: 20,
        searchVolume: 320,
        currentRank: 5,
        targetRank: 3
      },
      {
        keyword: 'funeral volunteer',
        difficulty: 42,
        searchVolume: 890,
        currentRank: 18,
        targetRank: 12
      }
    ],
    status: 'published',
    priority: 'medium',
    seoScore: 72
  },
  {
    title: 'Donate to Moksha Seva',
    slug: 'donate',
    url: 'https://mokshaseva.org/donate',
    metaTitle: 'Donate to Moksha Seva - Support Dignified Last Rites Services',
    metaDescription: 'Support Moksha Seva\'s mission by donating. Help us provide dignified last rites services to those who cannot afford them.',
    metaKeywords: 'donate moksha seva, funeral donation, charity donation',
    canonicalUrl: 'https://mokshaseva.org/donate',
    contentType: 'service',
    targetKeywords: [
      {
        keyword: 'donate moksha seva',
        difficulty: 18,
        searchVolume: 240,
        currentRank: 4,
        targetRank: 2
      }
    ],
    status: 'under_review',
    priority: 'medium',
    seoScore: 68
  },
  {
    title: 'Contact Moksha Seva',
    slug: 'contact',
    url: 'https://mokshaseva.org/contact',
    metaTitle: 'Contact Moksha Seva - Get Help with Last Rites Services',
    metaDescription: 'Contact Moksha Seva for immediate assistance with last rites services. Available 24/7 to help families in their time of need.',
    metaKeywords: 'contact moksha seva, funeral help, last rites contact',
    canonicalUrl: 'https://mokshaseva.org/contact',
    contentType: 'page',
    targetKeywords: [
      {
        keyword: 'contact moksha seva',
        difficulty: 15,
        searchVolume: 180,
        currentRank: 3,
        targetRank: 1
      }
    ],
    status: 'draft',
    priority: 'low',
    seoScore: 65
  }
];

const sampleContent = [
  {
    title: 'How to Perform Last Rites According to Hindu Traditions',
    slug: 'hindu-last-rites-guide',
    content: 'A comprehensive guide on performing last rites according to Hindu traditions...',
    excerpt: 'Learn the proper way to perform Hindu last rites with respect and dignity.',
    type: 'blog',
    category: 'resources',
    metaTitle: 'Hindu Last Rites Guide - Traditional Funeral Rituals',
    metaDescription: 'Complete guide on Hindu last rites and funeral rituals. Learn traditional practices for dignified farewell ceremonies.',
    focusKeyword: 'hindu last rites',
    keywords: ['hindu funeral', 'last rites rituals', 'traditional funeral', 'hindu ceremonies'],
    status: 'published',
    author: new mongoose.Types.ObjectId(), // Will be replaced with actual admin ID
    language: 'en'
  },
  {
    title: 'Understanding Different Funeral Customs in India',
    slug: 'indian-funeral-customs',
    content: 'India is a diverse country with various funeral customs and traditions...',
    excerpt: 'Explore the rich diversity of funeral customs across different communities in India.',
    type: 'blog',
    category: 'resources',
    metaTitle: 'Indian Funeral Customs - A Guide to Different Traditions',
    metaDescription: 'Discover various funeral customs and traditions practiced across different communities in India.',
    focusKeyword: 'indian funeral customs',
    keywords: ['funeral traditions', 'indian customs', 'cultural practices', 'funeral rituals'],
    status: 'published',
    author: new mongoose.Types.ObjectId(),
    language: 'en'
  }
];

const seedSEOData = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding SEO data...');
    
    // Clear existing data
    await SEOPage.deleteMany({});
    await Content.deleteMany({});
    
    console.log('🗑️  Cleared existing SEO and Content data');
    
    // Insert SEO pages
    const seoPages = await SEOPage.insertMany(sampleSEOPages);
    console.log(`✅ Created ${seoPages.length} SEO pages`);
    
    // Insert content
    const content = await Content.insertMany(sampleContent);
    console.log(`✅ Created ${content.length} content items`);
    
    // Calculate SEO scores for all pages
    for (const page of seoPages) {
      page.calculateSEOScore();
      await page.save();
    }
    
    console.log('📊 Updated SEO scores for all pages');
    console.log('🎉 SEO data seeding completed successfully!');
    
    // Display summary
    const stats = {
      totalPages: await SEOPage.countDocuments(),
      publishedPages: await SEOPage.countDocuments({ status: 'published' }),
      draftPages: await SEOPage.countDocuments({ status: 'draft' }),
      underReviewPages: await SEOPage.countDocuments({ status: 'under_review' }),
      avgScore: Math.round(seoPages.reduce((acc, page) => acc + page.seoScore, 0) / seoPages.length)
    };
    
    console.log('\n📈 SEO Statistics:');
    console.log(`   Total Pages: ${stats.totalPages}`);
    console.log(`   Published: ${stats.publishedPages}`);
    console.log(`   Draft: ${stats.draftPages}`);
    console.log(`   Under Review: ${stats.underReviewPages}`);
    console.log(`   Average SEO Score: ${stats.avgScore}/100`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding SEO data:', error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedSEOData();
}

module.exports = seedSEOData;