const mongoose = require('mongoose');
require('dotenv').config();

async function checkDoc() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha_seva');
        const Content = mongoose.model('Content', new mongoose.Schema({ slug: String, type: String }, { strict: false }));
        const homepage = await Content.findOne({ slug: 'homepage', type: 'page_config' });
        console.log('Homepage Doc Keys:', Object.keys(homepage?.toObject() || {}));
        console.log('SEO Data:', JSON.stringify(homepage?.seoTechnical, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDoc();
