const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Content = require('./models/Content');

async function checkSlug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const slug = 'dignity-in-departure-the-silent-mission-at-kashi';
    const doc = await Content.findOne({ slug });

    if (doc) {
      console.log('FOUND DOCUMENT:', JSON.stringify(doc, null, 2));
    } else {
      console.log('NO DOCUMENT FOUND WITH THIS SLUG');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSlug();
