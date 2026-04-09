const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Content = require('../models/Content');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const config = await Content.findOne({ slug: 'donate', type: 'page_config' });
        if (config) {
            const parsed = JSON.parse(config.content);
            fs.writeFileSync('donate_debug.json', JSON.stringify(parsed, null, 2));
            console.log('✅ Wrote to donate_debug.json');
        } else {
            console.log('❌ Configuration not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
