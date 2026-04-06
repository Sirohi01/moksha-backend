const mongoose = require('mongoose');
const SEOPage = require('../models/SEOPage');
require('dotenv').config();

async function checkHomepage() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha_seva');
    const page = await SEOPage.findOne({ slug: 'homepage' });
    console.log('--- HOMEPAGE SEO RECORD ---');
    console.log('ID:', page._id);
    console.log('Slug:', page.slug);
    console.log('Meta Title:', page.metaTitle);
    console.log('Status:', page.status);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
  }
}
checkHomepage();
