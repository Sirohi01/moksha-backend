const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const checkConfigs = async () => {
  await connectDB();
  const pages = ['blog', 'compliance'];
  for (const page of pages) {
    const config = await Content.findOne({ type: 'page_config', slug: page });
    if (config) {
      console.log(`✅ Config for ${page} exists`);
    } else {
      console.log(`❌ Config for ${page} IS MISSING`);
    }
  }
  process.exit(0);
};

checkConfigs();
