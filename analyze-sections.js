const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();
const connectDB = require('./config/database');

(async () => {
  try {
    await connectDB();
    const configs = await Content.find({ type: 'page_config' }).limit(5);
    
    configs.forEach(config => {
      console.log(`\n=== ${config.slug.toUpperCase()} ===`);
      const data = JSON.parse(config.content);
      Object.keys(data).forEach(key => {
        const value = data[key];
        const type = typeof value;
        const isArray = Array.isArray(value);
        const hasSubObjects = type === 'object' && !isArray && value !== null;
        
        console.log(`${key}: ${type} ${isArray ? '(array)' : hasSubObjects ? '(object with keys: ' + Object.keys(value).slice(0, 3).join(', ') + ')' : ''}`);
      });
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();