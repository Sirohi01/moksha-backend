const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Attempt to load .env from the backend root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ContentSchema = new mongoose.Schema({
    type: String,
    slug: String,
    content: String
}, { strict: false });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema, 'contents');

async function checkConfigs() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI not found in environment');

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const slugs = ['gallery', 'press', 'documentaries'];
        
        for (const slug of slugs) {
            const config = await Content.findOne({ type: 'page_config', slug });
            if (config) {
                console.log(`\n--- CONFIG FOR: ${slug} ---`);
                try {
                    console.log(JSON.stringify(JSON.parse(config.content), null, 2));
                } catch(e) {
                    console.log('DATA IS NOT JSON:', config.content);
                }
            } else {
                console.log(`\n--- CONFIG FOR: ${slug} NOT FOUND ---`);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

checkConfigs();
