const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ContentSchema = new mongoose.Schema({
    type: String,
    slug: String,
    content: String,
    version: Number,
    status: String,
    title: String,
    category: String,
    metaTitle: String,
    metaDescription: String
}, { strict: false });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema, 'contents');

const CLEAN_CONFIGS = {
  gallery: {
    hero: {
      badge: "Visual Archive",
      title: {
        line1: "Captured",
        line2: "Moments",
        line3: ""
      },
      description: "A curated collection of visual documentation showcasing our mission impact.",
      stats: {
        momentsCaptured: { number: "2.8K+", label: "Moments" },
        citiesDocumented: { number: "38+", label: "Cities" }
      }
    },
    gallery: {
      categories: ["All", "Services", "Community", "Events", "Volunteers"]
    },
    modal: {
      badge: "Verified Mission Data_",
      description: "Mission documentation from the Moksha Sewa Archive.",
      zoneLabel: "Operational Zone",
      dateLabel: "Deployment Date",
      returnButton: "Return to Archive Hub"
    }
  },
  press: {
    hero: {
      badge: "Official Media Syndicate . Prime",
      title: "GLOBAL",
      subtitle: "PRESS ROOM",
      description: "The centralized depository for authorized statements, media protocols, and official institutional announcements."
    },
    footer: {
      title: "REPOSITORY_ALPHA",
      protocolLabel: "PROTOCOL",
      categories: ["INTEGRITY", "JURISDICTION", "SYSTEM", "ACCESS"]
    }
  },
  documentaries: {
    hero: {
      badge: "Theatrical Collection . Prime",
      title: "CINEMA",
      subtitle: "MANIFESTO",
      description: "Documenting high-integrity narratives of human dignity and institutional impact across the globe."
    },
    footer: {
      title: "THEATER_OF_DIGNITY",
      hubLabel: "HUB",
      cities: ["VARANASI", "NEW DELHI", "NEW YORK", "GENEVA"]
    }
  }
};

async function resetConfigs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const [slug, config] of Object.entries(CLEAN_CONFIGS)) {
            const configString = JSON.stringify(config, null, 2);
            
            const result = await Content.findOneAndUpdate(
                { type: 'page_config', slug: slug },
                { 
                    $set: { 
                        content: configString,
                        version: 1,
                        status: 'published',
                        title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Page Configuration`,
                        category: 'configuration'
                    }
                },
                { upsert: true, new: true }
            );

            console.log(`✅ RESET: ${slug} (ID: ${result._id})`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err);
    }
}

resetConfigs();
