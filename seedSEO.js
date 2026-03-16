const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const SEOPage = require('./models/SEOPage');
const Content = require('./models/Content');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 MongoDB Connected for SEO seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// SEO data for all pages
const seoPages = [
  {
    title: 'Homepage',
    slug: 'homepage',
    url: '/',
    metaTitle: 'Moksha Seva — Dignity in Departure | Cremation Services',
    metaDescription: 'Moksha Seva provides dignified cremation services for unclaimed bodies, homeless individuals, and poor families across India.',
    metaKeywords: 'moksha seva, cremation services, unclaimed bodies, humanitarian, NGO, India, dignity, charity, donation, volunteer',
    ogTitle: 'Moksha Seva — Dignity in Departure',
    ogDescription: 'Providing dignified cremation services for unclaimed bodies and poor families across India.',
    ogType: 'website',
    ogImage: '/og-image.png',
    canonicalUrl: 'https://moksha-seva.org/',
    schemaType: 'Organization',
    robots: 'index, follow',
    status: 'published',
    priority: 'urgent'
  },
  {
    title: 'About Us',
    slug: 'about',
    url: '/about',
    metaTitle: 'About Moksha Seva | Our Mission & Vision',
    metaDescription: 'Learn about Moksha Seva\'s mission to provide dignified cremation services for unclaimed bodies. Our story, values, and commitment.',
    metaKeywords: 'about moksha seva, mission, vision, dignified cremation, humanitarian organization, unclaimed bodies',
    ogTitle: 'About Moksha Seva | Our Mission & Vision',
    ogDescription: 'Learn about our mission to provide dignified cremation services for unclaimed bodies across India.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'How It Works',
    slug: 'how-it-works',
    url: '/how-it-works',
    metaTitle: 'How Moksha Seva Works | Our Cremation Process',
    metaDescription: 'Discover our step-by-step process for providing dignified cremation services. From reporting to final rites - transparency.',
    metaKeywords: 'how moksha seva works, cremation process, dignified services, step by step, transparency',
    ogTitle: 'How Moksha Seva Works | Our Process',
    ogDescription: 'Discover our transparent process for providing dignified cremation services for unclaimed bodies.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Why Moksha Seva',
    slug: 'why-moksha-seva',
    url: '/why-moksha-seva',
    metaTitle: 'Why Choose Moksha Seva | Trusted Cremation Services',
    metaDescription: 'Why Moksha Seva is trusted for dignified cremation services. Our commitment to transparency, compassion, and respect.',
    metaKeywords: 'why moksha seva, trusted cremation services, dignity, transparency, compassion, respect',
    ogTitle: 'Why Choose Moksha Seva | Trusted Services',
    ogDescription: 'Discover why we are trusted for providing dignified cremation services with complete transparency.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Our Reach',
    slug: 'our-reach',
    url: '/our-reach',
    metaTitle: 'Our Reach | Moksha Seva Services Across India',
    metaDescription: 'Moksha Seva\'s presence across India. Cities and regions where we provide dignified cremation services for unclaimed bodies.',
    metaKeywords: 'moksha seva reach, india coverage, cremation services locations, nationwide service',
    ogTitle: 'Our Reach | Services Across India',
    ogDescription: 'Discover our nationwide presence and the cities where we provide dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Board of Directors',
    slug: 'board',
    url: '/board',
    metaTitle: 'Board of Directors | Leadership at Moksha Seva',
    metaDescription: 'Meet the dedicated board members leading Moksha Seva\'s mission to provide dignified cremation services across India.',
    metaKeywords: 'moksha seva board, directors, leadership, team, governance',
    ogTitle: 'Board of Directors | Moksha Seva Leadership',
    ogDescription: 'Meet our dedicated board members leading the mission of dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Services',
    slug: 'services',
    url: '/services',
    metaTitle: 'Our Services | Comprehensive Cremation Services',
    metaDescription: 'Complete range of services offered by Moksha Seva including cremation, documentation, family support, and volunteer programs.',
    metaKeywords: 'moksha seva services, cremation services, documentation, family support, volunteer programs',
    ogTitle: 'Our Services | Comprehensive Support',
    ogDescription: 'Explore our complete range of cremation and support services for families and communities.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Report Unclaimed Body',
    slug: 'report',
    url: '/report',
    metaTitle: 'Report Unclaimed Body | Emergency Response',
    metaDescription: 'Report an unclaimed body to Moksha Seva for immediate dignified cremation services. 24/7 emergency response across India.',
    metaKeywords: 'report unclaimed body, emergency response, moksha seva, immediate service, 24/7 support',
    ogTitle: 'Report Unclaimed Body | Emergency Response',
    ogDescription: 'Report an unclaimed body for immediate dignified cremation services. 24/7 emergency response.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'urgent'
  },
  {
    title: 'Impact & Statistics',
    slug: 'impact',
    url: '/impact',
    metaTitle: 'Our Impact | Statistics & Success Stories',
    metaDescription: 'See the impact of Moksha Seva\'s work. Statistics, success stories, and testimonials from our dignified cremation services.',
    metaKeywords: 'moksha seva impact, statistics, success stories, testimonials, dignified cremation results',
    ogTitle: 'Our Impact | Statistics & Success Stories',
    ogDescription: 'Discover the impact of our work through statistics, success stories, and testimonials.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Stories & Testimonials',
    slug: 'stories',
    url: '/stories',
    metaTitle: 'Stories & Testimonials | Real Impact',
    metaDescription: 'Read real stories and testimonials from families and communities touched by Moksha Seva\'s dignified cremation services.',
    metaKeywords: 'moksha seva stories, testimonials, real impact, family experiences, community support',
    ogTitle: 'Stories & Testimonials | Real Impact',
    ogDescription: 'Read inspiring stories and testimonials from families and communities we have served.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Remembrance',
    slug: 'remembrance',
    url: '/remembrance',
    metaTitle: 'Remembrance | Honoring Lives with Dignity',
    metaDescription: 'Honor and remember lives with dignity. Moksha Seva\'s remembrance services and memorial programs for those we serve.',
    metaKeywords: 'remembrance, memorial, honor lives, dignity, moksha seva memorial services',
    ogTitle: 'Remembrance | Honoring Lives with Dignity',
    ogDescription: 'Honor and remember lives with dignity through our memorial and remembrance services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Testimonials',
    slug: 'testimonials',
    url: '/testimonials',
    metaTitle: 'Testimonials | What People Say About Us',
    metaDescription: 'Read testimonials from families, volunteers, and partners about Moksha Seva\'s dignified cremation services and work.',
    metaKeywords: 'moksha seva testimonials, reviews, feedback, family experiences, volunteer testimonials',
    ogTitle: 'Testimonials | What People Say',
    ogDescription: 'Read what families, volunteers, and partners say about our dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Gallery',
    slug: 'gallery',
    url: '/gallery',
    metaTitle: 'Gallery | Moksha Seva in Action | Photos & Videos',
    metaDescription: 'View photos and videos of Moksha Seva\'s work providing dignified cremation services and community support across India.',
    metaKeywords: 'moksha seva gallery, photos, videos, cremation services, community work, humanitarian action',
    ogTitle: 'Gallery | Moksha Seva in Action',
    ogDescription: 'View photos and videos of our dignified cremation services and community support work.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'low'
  },
  {
    title: 'Feedback',
    slug: 'feedback',
    url: '/feedback',
    metaTitle: 'Feedback | Share Your Experience',
    metaDescription: 'Share your feedback and experience with Moksha Seva\'s services. Help us improve our dignified cremation services.',
    metaKeywords: 'moksha seva feedback, share experience, service improvement, testimonials, reviews',
    ogTitle: 'Feedback | Share Your Experience',
    ogDescription: 'Share your feedback and help us improve our dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Volunteer',
    slug: 'volunteer',
    url: '/volunteer',
    metaTitle: 'Volunteer with Moksha Seva | Join Our Mission',
    metaDescription: 'Join Moksha Seva as a volunteer and help provide dignified cremation services. Make a difference in your community.',
    metaKeywords: 'volunteer moksha seva, join mission, humanitarian work, community service, make difference',
    ogTitle: 'Volunteer | Join Our Mission',
    ogDescription: 'Join us as a volunteer and help provide dignified cremation services in your community.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Corporate Partnership',
    slug: 'corporate',
    url: '/corporate',
    metaTitle: 'Corporate Partnership | Partner with Us',
    metaDescription: 'Partner with Moksha Seva for meaningful corporate social responsibility. Support dignified cremation services across India.',
    metaKeywords: 'corporate partnership, CSR, social impact, moksha seva partnership, corporate responsibility',
    ogTitle: 'Corporate Partnership | Social Impact',
    ogDescription: 'Partner with us for meaningful corporate social responsibility and social impact.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Legacy Giving',
    slug: 'legacy-giving',
    url: '/legacy-giving',
    metaTitle: 'Legacy Giving | Leave a Lasting Impact',
    metaDescription: 'Create a lasting legacy through planned giving to Moksha Seva. Support dignified cremation services for future generations.',
    metaKeywords: 'legacy giving, planned giving, lasting impact, moksha seva donation, future generations',
    ogTitle: 'Legacy Giving | Lasting Impact',
    ogDescription: 'Create a lasting legacy through planned giving and support dignified services for future generations.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Tribute',
    slug: 'tribute',
    url: '/tribute',
    metaTitle: 'Tribute | Honor Loved Ones',
    metaDescription: 'Honor your loved ones with a tribute donation to Moksha Seva. Support dignified cremation services in their memory.',
    metaKeywords: 'tribute donation, honor loved ones, memorial donation, moksha seva tribute, in memory',
    ogTitle: 'Tribute | Honor Loved Ones',
    ogDescription: 'Honor your loved ones with a tribute donation supporting dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Transparency',
    slug: 'transparency',
    url: '/transparency',
    metaTitle: 'Transparency | Financial Reports',
    metaDescription: 'Complete transparency in Moksha Seva\'s operations. View financial reports, audits, and accountability measures.',
    metaKeywords: 'moksha seva transparency, financial reports, accountability, audits, operations transparency',
    ogTitle: 'Transparency | Financial Reports & Accountability',
    ogDescription: 'Complete transparency in our operations with financial reports and accountability measures.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Government Schemes',
    slug: 'schemes',
    url: '/schemes',
    metaTitle: 'Government Schemes | Support for Cremation',
    metaDescription: 'Information about government schemes and support available for cremation services through Moksha Seva.',
    metaKeywords: 'government schemes, cremation support, financial assistance, moksha seva schemes, government aid',
    ogTitle: 'Government Schemes | Available Support',
    ogDescription: 'Information about government schemes and support available for cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Contact Us',
    slug: 'contact',
    url: '/contact',
    metaTitle: 'Contact Moksha Seva | Get in Touch',
    metaDescription: 'Contact Moksha Seva for dignified cremation services, volunteer opportunities, or general inquiries. 24/7 emergency support.',
    metaKeywords: 'contact moksha seva, cremation services contact, emergency support, volunteer contact, inquiries',
    ogTitle: 'Contact Us | Get in Touch',
    ogDescription: 'Contact us for dignified cremation services, volunteer opportunities, or general inquiries.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'high'
  },
  {
    title: 'Press & Media',
    slug: 'press',
    url: '/press',
    metaTitle: 'Press & Media | News & Coverage',
    metaDescription: 'Latest news, press releases, and media coverage about Moksha Seva\'s dignified cremation services and humanitarian work.',
    metaKeywords: 'moksha seva news, press releases, media coverage, humanitarian news, cremation services news',
    ogTitle: 'Press & Media | News & Coverage',
    ogDescription: 'Latest news, press releases, and media coverage about our humanitarian work.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Documentaries',
    slug: 'documentaries',
    url: '/documentaries',
    metaTitle: 'Documentaries | Stories & Impact Videos',
    metaDescription: 'Watch documentaries and videos showcasing Moksha Seva\'s impact in providing dignified cremation services across India.',
    metaKeywords: 'moksha seva documentaries, impact videos, stories, humanitarian documentaries, cremation services videos',
    ogTitle: 'Documentaries | Stories & Impact',
    ogDescription: 'Watch documentaries showcasing our impact in providing dignified cremation services.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'index, follow',
    status: 'published',
    priority: 'medium'
  },
  {
    title: 'Layout Configuration',
    slug: 'layout',
    url: '/layout',
    metaTitle: 'Layout | Site Configuration',
    metaDescription: 'Site layout and configuration settings for Moksha Seva website navigation and structure.',
    metaKeywords: 'moksha seva layout, site configuration, navigation, website structure',
    ogTitle: 'Layout | Site Configuration',
    ogDescription: 'Site layout and configuration settings for optimal user experience.',
    ogType: 'website',
    schemaType: 'WebPage',
    robots: 'noindex, nofollow',
    status: 'published',
    priority: 'low'
  }
];

// Seed SEO data
const seedSEO = async () => {
  try {
    console.log('🌱 Starting SEO data seeding...');

    // Clear existing SEO data (optional - remove if you want to keep existing)
    // await SEOPage.deleteMany({});
    // console.log('🗑️ Cleared existing SEO data');

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const seoData of seoPages) {
      try {
        // Check if SEO page already exists
        const existingSEO = await SEOPage.findOne({
          $or: [
            { slug: seoData.slug },
            { url: seoData.url }
          ]
        });

        if (existingSEO) {
          console.log(`⏭️ SEO page already exists: ${seoData.slug}`);
          skipped++;
          continue;
        }

        // Create new SEO page
        const seoPage = new SEOPage({
          ...seoData,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastOptimized: new Date()
        });

        // Calculate SEO score
        seoPage.calculateSEOScore();
        
        await seoPage.save();
        console.log(`✅ Created SEO page: ${seoData.slug} (Score: ${seoPage.seoScore})`);
        created++;

      } catch (error) {
        console.error(`❌ Failed to create SEO page for ${seoData.slug}:`, error.message);
      }
    }

    console.log('\n📊 SEO Seeding Summary:');
    console.log(`✅ Created: ${created} pages`);
    console.log(`📝 Updated: ${updated} pages`);
    console.log(`⏭️ Skipped: ${skipped} pages`);
    console.log(`📄 Total: ${seoPages.length} pages processed`);

    return {
      success: true,
      created,
      updated,
      skipped,
      total: seoPages.length
    };

  } catch (error) {
    console.error('❌ SEO seeding failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run seeding if called directly
if (require.main === module) {
  connectDB().then(async () => {
    const result = await seedSEO();
    
    if (result.success) {
      console.log('\n🎉 SEO seeding completed successfully!');
    } else {
      console.log('\n💥 SEO seeding failed:', result.error);
    }
    
    process.exit(0);
  });
}

module.exports = seedSEO;