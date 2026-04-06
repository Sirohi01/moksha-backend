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
    category: String
}, { strict: false });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema, 'contents');

const BLOG_CONFIG = {
  hero: {
    badge: "MOKSHA INSIGHTS",
    title: "SACRED",
    highlightText: "REVELATIONS",
    description: "A curated documentation of our humanitarian impact, legislative progress, and the philosophy of dignity."
  },
  subscriptionCTA: {
    badge: "The Sacred Digest",
    title: "STAY IN THE",
    highlightText: "SACRED LOOP",
    description: "Join a community of souls dedicated to dignity. Get monthly mission updates delivered to your sanctum.",
    inputPlaceholder: "ENTER EMAIL ADDRESS",
    buttonText: "SUBSCRIBE"
  }
};

async function resetBlogConfig() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const configString = JSON.stringify(BLOG_CONFIG, null, 2);
        
        const result = await Content.findOneAndUpdate(
            { type: 'page_config', slug: 'blog' },
            { 
                $set: { 
                    content: configString,
                    version: 1,
                    status: 'published',
                    title: `Blog Page Configuration`,
                    category: 'configuration'
                }
            },
            { upsert: true, new: true }
        );

        console.log(`✅ RESET: Blog (ID: ${result._id})`);
        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

resetBlogConfig();
