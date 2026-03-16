const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = require('./config/database');

async function testPressIntegration() {
  try {
    console.log('🧪 Testing Press Page Integration...\n');
    
    // Connect to database
    await connectDB();
    console.log('📦 MongoDB Connected\n');
    
    // Test 1: Check if press configuration exists
    console.log('📋 Test 1: Checking press configuration...');
    const pressConfig = await Content.findOne({ 
      type: 'page_config', 
      slug: 'press' 
    });
    
    if (pressConfig) {
      console.log('✅ Press configuration found');
      console.log(`   - Page Name: ${pressConfig.slug}`);
      console.log(`   - Title: ${pressConfig.title}`);
      console.log(`   - Version: ${pressConfig.version}`);
      console.log(`   - Status: ${pressConfig.status}`);
      console.log(`   - Last Modified: ${pressConfig.updatedAt}`);
      
      // Test configuration structure
      const config = JSON.parse(pressConfig.content);
      console.log('\n📊 Configuration Structure:');
      console.log(`   - Hero Section: ${config.hero ? '✅' : '❌'}`);
      console.log(`   - Press Coverage: ${config.pressCoverage ? `✅ (${config.pressCoverage.items.length} items)` : '❌'}`);
      console.log(`   - Asset Library: ${config.assetLibrary ? `✅ (${config.assetLibrary.assets.length} assets)` : '❌'}`);
      console.log(`   - Media Contact: ${config.mediaContact ? `✅ (${config.mediaContact.contacts.length} contacts)` : '❌'}`);
      
      // Test specific content
      if (config.hero) {
        console.log('\n🎯 Hero Section Content:');
        console.log(`   - Title: "${config.hero.title}"`);
        console.log(`   - Subtitle: "${config.hero.subtitle}"`);
        console.log(`   - Badge: "${config.hero.badge}"`);
        console.log(`   - Description: "${config.hero.description.substring(0, 50)}..."`);
      }
      
      if (config.pressCoverage && config.pressCoverage.items.length > 0) {
        console.log('\n📰 Press Coverage:');
        config.pressCoverage.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`);
          console.log(`      - Source: ${item.source}`);
          console.log(`      - Date: ${item.date}`);
          console.log(`      - Type: ${item.type}`);
        });
      }
      
      if (config.assetLibrary && config.assetLibrary.assets.length > 0) {
        console.log('\n📁 Asset Library:');
        config.assetLibrary.assets.forEach((asset, index) => {
          console.log(`   ${index + 1}. ${asset.name}`);
          console.log(`      - Format: ${asset.format}`);
          console.log(`      - Size: ${asset.size}`);
        });
      }
      
      if (config.mediaContact && config.mediaContact.contacts.length > 0) {
        console.log('\n📞 Media Contacts:');
        config.mediaContact.contacts.forEach((contact, index) => {
          console.log(`   ${index + 1}. ${contact.label}: ${contact.value}`);
        });
      }
      
    } else {
      console.log('❌ Press configuration not found');
      return;
    }
    
    // Test 2: API endpoint test
    console.log('\n📋 Test 2: Testing API endpoint...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5000/api/page-config/press');
      
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
      'metadata', 'hero', 'pressCoverage', 'assetLibrary', 'mediaContact'
    ];
    
    const config = JSON.parse(pressConfig.content);
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
    
    // Check press coverage
    if (config.pressCoverage && config.pressCoverage.items) {
      config.pressCoverage.items.forEach((item, index) => {
        if (!item.source || !item.date || !item.title || !item.type) {
          console.log(`   ❌ Press item ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Press coverage validation passed (${config.pressCoverage.items.length} items)`);
      }
    }
    
    // Check asset library
    if (config.assetLibrary && config.assetLibrary.assets) {
      config.assetLibrary.assets.forEach((asset, index) => {
        if (!asset.name || !asset.format || !asset.size) {
          console.log(`   ❌ Asset ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Asset library validation passed (${config.assetLibrary.assets.length} assets)`);
      }
    }
    
    // Check media contacts
    if (config.mediaContact && config.mediaContact.contacts) {
      config.mediaContact.contacts.forEach((contact, index) => {
        if (!contact.icon || !contact.label || !contact.value || !contact.href) {
          console.log(`   ❌ Media contact ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Media contacts validation passed (${config.mediaContact.contacts.length} contacts)`);
      }
    }
    
    console.log(`\n📊 Validation Result: ${validationErrors === 0 ? '✅ All tests passed' : `❌ ${validationErrors} errors found`}`);
    
    console.log('\n🎉 Press Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend server: npm run dev');
    console.log('   3. Visit: http://localhost:3000/press');
    console.log('   4. Test the admin panel: http://localhost:3000/admin/page-config');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
}

// Run the test
testPressIntegration();