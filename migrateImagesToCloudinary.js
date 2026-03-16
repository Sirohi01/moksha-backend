const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { uploadToCloudinary } = require('./services/cloudinaryService');
const Content = require('./models/Content');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha-seva', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const migrateImagesToCloudinary = async () => {
  try {
    console.log('🚀 Starting image migration to Cloudinary...');
    
    // Test Cloudinary connection first
    try {
      const testResult = await cloudinary.api.ping();
      console.log('✅ Cloudinary connection successful:', testResult);
    } catch (error) {
      console.error('❌ Cloudinary connection failed:', error.message);
      console.log('🔧 Please check your Cloudinary credentials in .env file');
      return;
    }
    
    // Define the gallery directory path
    const galleryPath = path.join(__dirname, '../frontend/public/gallery');
    
    // Check if gallery directory exists
    if (!fs.existsSync(galleryPath)) {
      console.log('📁 Gallery directory not found, creating it...');
      fs.mkdirSync(galleryPath, { recursive: true });
      
      // Create some sample placeholder images using a simple approach
      console.log('🎨 Creating sample placeholder images...');
      
      const sampleImages = [
        'image1.png', 'image2.png', 'image3.png', 'image4.png', 'image5.png', 'image6.png',
        'image001.png', 'image002.png', 'image003.png', 'image004.png', 'image005.png',
        'hero_moksha_1.png'
      ];
      
      // Create simple 1x1 pixel PNG files as placeholders
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x01, 0x21, 0x18, 0xE6, 0x27, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      
      for (const imageName of sampleImages) {
        const imagePath = path.join(galleryPath, imageName);
        fs.writeFileSync(imagePath, pngBuffer);
        console.log(`✅ Created placeholder: ${imageName}`);
      }
    }
    
    // Read all files from gallery directory
    const files = fs.readdirSync(galleryPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    console.log(`📸 Found ${imageFiles.length} images to migrate`);
    
    if (imageFiles.length === 0) {
      console.log('⚠️  No images found to migrate');
      return;
    }
    
    const imageMapping = {};
    let uploadedCount = 0;
    
    // Upload each image to Cloudinary
    for (const filename of imageFiles) {
      try {
        console.log(`⬆️  Uploading ${filename}...`);
        
        const filePath = path.join(galleryPath, filename);
        const fileBuffer = fs.readFileSync(filePath);
        
        // Create a file-like object for the upload function
        const fileObj = {
          buffer: fileBuffer,
          originalname: filename,
          mimetype: `image/${path.extname(filename).slice(1)}`
        };
        
        const result = await uploadToCloudinary(fileObj, 'moksha-seva/gallery');
        
        imageMapping[`/gallery/${filename}`] = result.url;
        uploadedCount++;
        
        console.log(`✅ Uploaded ${filename} -> ${result.url}`);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
        console.error('Error details:', error);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successfully uploaded: ${uploadedCount} images`);
    console.log(`❌ Failed uploads: ${imageFiles.length - uploadedCount} images`);
    
    // Update page configurations with new Cloudinary URLs
    if (Object.keys(imageMapping).length > 0) {
      console.log('\n🔄 Updating page configurations...');
      
      const pageConfigs = await Content.find({ type: 'page_config' });
      let updatedConfigs = 0;
      
      for (const config of pageConfigs) {
        try {
          let configContent = JSON.parse(config.content);
          let hasChanges = false;
          
          // Recursively replace image URLs
          const replaceImageUrls = (obj) => {
            if (typeof obj === 'string') {
              for (const [oldUrl, newUrl] of Object.entries(imageMapping)) {
                if (obj === oldUrl) {
                  hasChanges = true;
                  return newUrl;
                }
              }
              return obj;
            } else if (Array.isArray(obj)) {
              return obj.map(replaceImageUrls);
            } else if (obj && typeof obj === 'object') {
              const newObj = {};
              for (const [key, value] of Object.entries(obj)) {
                newObj[key] = replaceImageUrls(value);
              }
              return newObj;
            }
            return obj;
          };
          
          configContent = replaceImageUrls(configContent);
          
          if (hasChanges) {
            config.content = JSON.stringify(configContent, null, 2);
            config.version = (config.version || 1) + 1;
            
            // Add to previous versions
            config.previousVersions.push({
              version: config.version - 1,
              content: config.content,
              modifiedBy: null,
              changeLog: 'Migrated images to Cloudinary'
            });
            
            await config.save();
            updatedConfigs++;
            console.log(`✅ Updated ${config.slug} page configuration`);
          }
          
        } catch (error) {
          console.error(`❌ Failed to update ${config.slug}:`, error.message);
        }
      }
      
      console.log(`\n📊 Configuration Update Summary:`);
      console.log(`✅ Updated configurations: ${updatedConfigs}`);
      
      // Save image mapping to a file for reference
      const mappingPath = path.join(__dirname, 'image-migration-mapping.json');
      fs.writeFileSync(mappingPath, JSON.stringify(imageMapping, null, 2));
      console.log(`📄 Image mapping saved to: ${mappingPath}`);
    }
    
    console.log('\n🎉 Image migration completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the migration
if (require.main === module) {
  migrateImagesToCloudinary();
}

module.exports = { migrateImagesToCloudinary };