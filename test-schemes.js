const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = require('./config/database');

async function testSchemesIntegration() {
  try {
    console.log('🧪 Testing Schemes Page Integration...\n');
    
    // Connect to database
    await connectDB();
    console.log('📦 MongoDB Connected\n');
    
    // Test 1: Check if schemes configuration exists
    console.log('📋 Test 1: Checking schemes configuration...');
    const schemesConfig = await Content.findOne({ 
      type: 'page_config', 
      slug: 'schemes' 
    });
    
    if (schemesConfig) {
      console.log('✅ Schemes configuration found');
      console.log(`   - Page Name: ${schemesConfig.slug}`);
      console.log(`   - Title: ${schemesConfig.title}`);
      console.log(`   - Version: ${schemesConfig.version}`);
      console.log(`   - Status: ${schemesConfig.status}`);
      console.log(`   - Last Modified: ${schemesConfig.updatedAt}`);
      
      // Test configuration structure
      const config = JSON.parse(schemesConfig.content);
      console.log('\n📊 Configuration Structure:');
      console.log(`   - Hero Section: ${config.hero ? '✅' : '❌'}`);
      console.log(`   - Central Schemes: ${config.centralSchemes ? `✅ (${config.centralSchemes.length} schemes)` : '❌'}`);
      console.log(`   - State Schemes: ${config.stateSchemes ? `✅ (${config.stateSchemes.length} states)` : '❌'}`);
      console.log(`   - Other Schemes: ${config.otherSchemes ? `✅ (${config.otherSchemes.length} schemes)` : '❌'}`);
      console.log(`   - Form Configuration: ${config.form ? '✅' : '❌'}`);
      console.log(`   - Help Section: ${config.help ? '✅' : '❌'}`);
      
      // Test specific content
      if (config.hero) {
        console.log('\n🎯 Hero Section Content:');
        console.log(`   - Title: "${config.hero.title}"`);
        console.log(`   - Subtitle: "${config.hero.subtitle}"`);
        console.log(`   - Badge: "${config.hero.badge}"`);
      }
      
      if (config.centralSchemes && config.centralSchemes.length > 0) {
        console.log('\n🏛️ Central Government Schemes:');
        config.centralSchemes.forEach((scheme, index) => {
          console.log(`   ${index + 1}. ${scheme.title}`);
          console.log(`      - Authority: ${scheme.authority}`);
          console.log(`      - Benefit: ${scheme.benefit}`);
        });
      }
      
      if (config.stateSchemes && config.stateSchemes.length > 0) {
        console.log('\n🗺️ State-wise Schemes:');
        config.stateSchemes.forEach((state, index) => {
          console.log(`   ${index + 1}. ${state.state} (${state.schemes.length} schemes)`);
        });
      }
      
      if (config.form) {
        console.log('\n📝 Form Configuration:');
        console.log(`   - Labels: ${Object.keys(config.form.labels).length} fields`);
        console.log(`   - Placeholders: ${Object.keys(config.form.placeholders).length} fields`);
        console.log(`   - Success Message: "${config.form.success.title}"`);
      }
      
      if (config.help) {
        console.log('\n🆘 Help Section:');
        console.log(`   - Phone: ${config.help.phone}`);
        console.log(`   - Email: ${config.help.email}`);
      }
      
    } else {
      console.log('❌ Schemes configuration not found');
      return;
    }
    
    // Test 2: API endpoint test
    console.log('\n📋 Test 2: Testing API endpoint...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5000/api/page-config/schemes');
      
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
      'metadata', 'hero', 'tabs', 'centralSchemes', 'stateSchemes', 
      'otherSchemes', 'assistanceTypes', 'helpSources', 'sections', 
      'buttons', 'tableHeaders', 'form', 'help', 'states'
    ];
    
    const config = JSON.parse(schemesConfig.content);
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
    
    // Check central schemes
    if (config.centralSchemes) {
      config.centralSchemes.forEach((scheme, index) => {
        if (!scheme.title || !scheme.benefit || !scheme.eligibility) {
          console.log(`   ❌ Central scheme ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Central schemes validation passed (${config.centralSchemes.length} schemes)`);
      }
    }
    
    // Check state schemes
    if (config.stateSchemes) {
      config.stateSchemes.forEach((stateData, index) => {
        if (!stateData.state || !stateData.schemes || !Array.isArray(stateData.schemes)) {
          console.log(`   ❌ State ${index + 1}: Invalid structure`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ State schemes validation passed (${config.stateSchemes.length} states)`);
      }
    }
    
    // Check form configuration
    if (config.form && config.form.labels && config.form.placeholders) {
      const labelKeys = Object.keys(config.form.labels);
      const placeholderKeys = Object.keys(config.form.placeholders);
      
      if (labelKeys.length > 0 && placeholderKeys.length > 0) {
        console.log(`   ✅ Form configuration valid (${labelKeys.length} labels, ${placeholderKeys.length} placeholders)`);
      } else {
        console.log(`   ❌ Form configuration incomplete`);
        validationErrors++;
      }
    }
    
    console.log(`\n📊 Validation Result: ${validationErrors === 0 ? '✅ All tests passed' : `❌ ${validationErrors} errors found`}`);
    
    console.log('\n🎉 Schemes Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend server: npm run dev');
    console.log('   3. Visit: http://localhost:3000/schemes');
    console.log('   4. Test the admin panel: http://localhost:3000/admin/page-config');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
}

// Run the test
testSchemesIntegration();