const Content = require('./models/Content');
const MediaAsset = require('./models/MediaAsset');
require('dotenv').config();

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha-seva', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkImageSources = async () => {
  try {
    console.log('🔍 Checking image sources across the system...\n');
    
    // Check page configurations
    console.log('📄 Checking Page Configurations:');
    const pageConfigs = await Content.find({ type: 'page_config' });
    
    const imageStats = {
      cloudinary: 0,
      local: 0,
      external: 0,
      total: 0
    };
    
    const localImages = new Set();
    const cloudinaryImages = new Set();
    const externalImages = new Set();
    
    const extractImages = (obj, path = '') => {
      if (typeof obj === 'string') {
        // Check if it's an image URL
        if (obj.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || obj.includes('image') || obj.includes('gallery')) {
          imageStats.total++;
          
          if (obj.includes('cloudinary.com') || obj.includes('res.cloudinary.com')) {
            imageStats.cloudinary++;
            cloudinaryImages.add(obj);
          } else if (obj.startsWith('/gallery/') || obj.startsWith('./') || obj.startsWith('../')) {
            imageStats.local++;
            localImages.add(obj);
          } else if (obj.startsWith('http')) {
            imageStats.external++;
            externalImages.add(obj);
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => extractImages(item, `${path}[${index}]`));
      } else if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([key, value]) => {
          extractImages(value, path ? `${path}.${key}` : key);
        });
      }
    };
    
    for (const config of pageConfigs) {
      try {
        const configContent = JSON.parse(config.content);
        console.log(`  📋 ${config.slug}:`);
        
        const beforeStats = { ...imageStats };
        extractImages(configContent);
        
        const pageImages = {
          cloudinary: imageStats.cloudinary - beforeStats.cloudinary,
          local: imageStats.local - beforeStats.local,
          external: imageStats.external - beforeStats.external,
          total: imageStats.total - beforeStats.total
        };
        
        console.log(`    ☁️  Cloudinary: ${pageImages.cloudinary}`);
        console.log(`    📁 Local: ${pageImages.local}`);
        console.log(`    🌐 External: ${pageImages.external}`);
        console.log(`    📊 Total: ${pageImages.total}\n`);
        
      } catch (error) {
        console.error(`    ❌ Error parsing ${config.slug}:`, error.message);
      }
    }
    
    // Check media assets
    console.log('🖼️  Checking Media Assets:');
    const mediaAssets = await MediaAsset.find({});
    
    for (const asset of mediaAssets) {
      imageStats.total++;
      
      if (asset.url.includes('cloudinary.com') || asset.url.includes('res.cloudinary.com')) {
        imageStats.cloudinary++;
        cloudinaryImages.add(asset.url);
      } else if (asset.url.startsWith('/') || asset.url.startsWith('./')) {
        imageStats.local++;
        localImages.add(asset.url);
      } else if (asset.url.startsWith('http')) {
        imageStats.external++;
        externalImages.add(asset.url);
      }
    }
    
    console.log(`  📊 Media Assets: ${mediaAssets.length} total`);
    
    // Summary
    console.log('\n📊 OVERALL SUMMARY:');
    console.log('='.repeat(50));
    console.log(`☁️  Cloudinary Images: ${imageStats.cloudinary} (${((imageStats.cloudinary/imageStats.total)*100).toFixed(1)}%)`);
    console.log(`📁 Local Images: ${imageStats.local} (${((imageStats.local/imageStats.total)*100).toFixed(1)}%)`);
    console.log(`🌐 External Images: ${imageStats.external} (${((imageStats.external/imageStats.total)*100).toFixed(1)}%)`);
    console.log(`📊 Total Images: ${imageStats.total}`);
    
    if (localImages.size > 0) {
      console.log('\n⚠️  LOCAL IMAGES FOUND (Need Migration):');
      console.log('='.repeat(50));
      Array.from(localImages).forEach(img => console.log(`  📁 ${img}`));
    }
    
    if (cloudinaryImages.size > 0) {
      console.log('\n✅ CLOUDINARY IMAGES:');
      console.log('='.repeat(50));
      Array.from(cloudinaryImages).slice(0, 10).forEach(img => console.log(`  ☁️  ${img}`));
      if (cloudinaryImages.size > 10) {
        console.log(`  ... and ${cloudinaryImages.size - 10} more`);
      }
    }
    
    if (externalImages.size > 0) {
      console.log('\n🌐 EXTERNAL IMAGES:');
      console.log('='.repeat(50));
      Array.from(externalImages).forEach(img => console.log(`  🌐 ${img}`));
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    if (imageStats.local > 0) {
      console.log(`⚠️  ${imageStats.local} local images need migration to Cloudinary`);
      console.log('   Run: node migrateImagesToCloudinary.js');
    }
    
    if (imageStats.cloudinary === imageStats.total) {
      console.log('🎉 All images are properly served from Cloudinary!');
    } else {
      console.log(`🔄 ${imageStats.total - imageStats.cloudinary} images still need migration`);
    }
    
    console.log('\n✅ Image source check completed!');
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the check
if (require.main === module) {
  checkImageSources();
}

module.exports = { checkImageSources };