const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const testCloudinary = async () => {
  try {
    console.log('🔧 Testing Cloudinary Configuration...');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set');
    
    // Test connection
    console.log('\n📡 Testing connection...');
    const pingResult = await cloudinary.api.ping();
    console.log('✅ Ping successful:', pingResult);
    
    // Test upload with a simple base64 image
    console.log('\n⬆️  Testing upload...');
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'moksha-seva/test',
      public_id: 'test-image-' + Date.now(),
      resource_type: 'image'
    });
    
    console.log('✅ Upload successful!');
    console.log('URL:', uploadResult.secure_url);
    console.log('Public ID:', uploadResult.public_id);
    
    // Clean up test image
    console.log('\n🗑️  Cleaning up test image...');
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('✅ Test image deleted');
    
    console.log('\n🎉 Cloudinary is working perfectly!');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('Invalid API Key')) {
      console.log('\n💡 Fix: Check your CLOUDINARY_API_KEY in .env file');
    } else if (error.message.includes('Invalid API Secret')) {
      console.log('\n💡 Fix: Check your CLOUDINARY_API_SECRET in .env file');
    } else if (error.message.includes('Invalid cloud name')) {
      console.log('\n💡 Fix: Check your CLOUDINARY_CLOUD_NAME in .env file');
    }
  }
};

// Run the test
testCloudinary();