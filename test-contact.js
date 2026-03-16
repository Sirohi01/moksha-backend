const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = require('./config/database');

async function testContactIntegration() {
  try {
    console.log('🧪 Testing Contact Page Integration...\n');
    
    // Connect to database
    await connectDB();
    console.log('📦 MongoDB Connected\n');
    
    // Test 1: Check if contact configuration exists
    console.log('📋 Test 1: Checking contact configuration...');
    const contactConfig = await Content.findOne({ 
      type: 'page_config', 
      slug: 'contact' 
    });
    
    if (contactConfig) {
      console.log('✅ Contact configuration found');
      console.log(`   - Page Name: ${contactConfig.slug}`);
      console.log(`   - Title: ${contactConfig.title}`);
      console.log(`   - Version: ${contactConfig.version}`);
      console.log(`   - Status: ${contactConfig.status}`);
      console.log(`   - Last Modified: ${contactConfig.updatedAt}`);
      
      // Test configuration structure
      const config = JSON.parse(contactConfig.content);
      console.log('\n📊 Configuration Structure:');
      console.log(`   - Hero Section: ${config.hero ? '✅' : '❌'}`);
      console.log(`   - Contact Info: ${config.contactInfo ? `✅ (${config.contactInfo.length} items)` : '❌'}`);
      console.log(`   - Regional Coordinators: ${config.regionalCoordinators ? `✅ (${config.regionalCoordinators.coordinators.length} coordinators)` : '❌'}`);
      console.log(`   - Form Configuration: ${config.form ? '✅' : '❌'}`);
      console.log(`   - Sections: ${config.sections ? '✅' : '❌'}`);
      
      // Test specific content
      if (config.hero) {
        console.log('\n🎯 Hero Section Content:');
        console.log(`   - Title: "${config.hero.title}"`);
        console.log(`   - Badge: "${config.hero.badge}"`);
        console.log(`   - Description: "${config.hero.description.substring(0, 50)}..."`);
      }
      
      if (config.contactInfo && config.contactInfo.length > 0) {
        console.log('\n📞 Contact Information:');
        config.contactInfo.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      - Info: ${item.info}`);
          console.log(`      - Sub: ${item.sub}`);
        });
      }
      
      if (config.regionalCoordinators && config.regionalCoordinators.coordinators.length > 0) {
        console.log('\n🗺️ Regional Coordinators:');
        config.regionalCoordinators.coordinators.forEach((coord, index) => {
          console.log(`   ${index + 1}. ${coord.city} - ${coord.name} (${coord.phone})`);
        });
      }
      
      if (config.form) {
        console.log('\n📝 Form Configuration:');
        console.log(`   - Labels: ${Object.keys(config.form.labels).length} fields`);
        console.log(`   - Placeholders: ${Object.keys(config.form.placeholders).length} fields`);
        console.log(`   - Subject Options: ${config.form.subjectOptions.length} options`);
        console.log(`   - Success Message: "${config.form.success.title}"`);
      }
      
    } else {
      console.log('❌ Contact configuration not found');
      return;
    }
    
    // Test 2: API endpoint test
    console.log('\n📋 Test 2: Testing API endpoint...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5000/api/page-config/contact');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working');
        console.log(`   - Success: ${data.success}`);
        console.log(`   - Message: ${data.message}`);
        console.log(`   - Data Available: ${data.data ? '✅' : '❌'}`);
      } else {
        console.log(`❌ API endpoint failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`⚠️  API test skipped (server not running): ${error.message}`);
    }
    
    // Test 3: Configuration completeness
    console.log('\n📋 Test 3: Configuration completeness check...');
    const requiredSections = [
      'metadata', 'hero', 'contactInfo', 'regionalCoordinators', 
      'form', 'sections'
    ];
    
    const config = JSON.parse(contactConfig.content);
    let missingCount = 0;
    
    requiredSections.forEach(section => {
      if (config[section]) {
        console.log(`   ✅ ${section}`);
      } else {
        console.log(`   ❌ ${section} (missing)`);
        missingCount++;
      }
    });
    
    console.log(`\n📊 Completeness: ${((requiredSections.length - missingCount) / requiredSections.length * 100).toFixed(1)}%`);
    
    // Test 4: Data validation
    console.log('\n📋 Test 4: Data validation...');
    let validationErrors = 0;
    
    // Check contact info
    if (config.contactInfo) {
      config.contactInfo.forEach((item, index) => {
        if (!item.title || !item.info || !item.icon) {
          console.log(`   ❌ Contact info ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Contact info validation passed (${config.contactInfo.length} items)`);
      }
    }
    
    // Check regional coordinators
    if (config.regionalCoordinators && config.regionalCoordinators.coordinators) {
      config.regionalCoordinators.coordinators.forEach((coord, index) => {
        if (!coord.city || !coord.name || !coord.phone) {
          console.log(`   ❌ Regional coordinator ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Regional coordinators validation passed (${config.regionalCoordinators.coordinators.length} coordinators)`);
      }
    }
    
    // Check form configuration
    if (config.form && config.form.labels && config.form.placeholders && config.form.subjectOptions) {
      const labelKeys = Object.keys(config.form.labels);
      const placeholderKeys = Object.keys(config.form.placeholders);
      
      if (labelKeys.length > 0 && placeholderKeys.length > 0 && config.form.subjectOptions.length > 0) {
        console.log(`   ✅ Form configuration valid (${labelKeys.length} labels, ${placeholderKeys.length} placeholders, ${config.form.subjectOptions.length} subject options)`);
      } else {
        console.log(`   ❌ Form configuration incomplete`);
        validationErrors++;
      }
    }
    
    console.log(`\n📊 Validation Result: ${validationErrors === 0 ? '✅ All tests passed' : `❌ ${validationErrors} errors found`}`);
    
    console.log('\n🎉 Contact Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend server: npm run dev');
    console.log('   3. Visit: http://localhost:3000/contact');
    console.log('   4. Test the admin panel: http://localhost:3000/admin/page-config');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
}

// Run the test
testContactIntegration();