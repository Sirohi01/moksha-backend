const mongoose = require('mongoose');
const Content = require('./models/Content');
require('dotenv').config();

const connectDB = require('./config/database');

async function testDocumentariesIntegration() {
  try {
    console.log('🧪 Testing Documentaries Page Integration...\n');
    
    // Connect to database
    await connectDB();
    console.log('📦 MongoDB Connected\n');
    
    // Test 1: Check if documentaries configuration exists
    console.log('📋 Test 1: Checking documentaries configuration...');
    const documentariesConfig = await Content.findOne({ 
      type: 'page_config', 
      slug: 'documentaries' 
    });
    
    if (documentariesConfig) {
      console.log('✅ Documentaries configuration found');
      console.log(`   - Page Name: ${documentariesConfig.slug}`);
      console.log(`   - Title: ${documentariesConfig.title}`);
      console.log(`   - Version: ${documentariesConfig.version}`);
      console.log(`   - Status: ${documentariesConfig.status}`);
      console.log(`   - Last Modified: ${documentariesConfig.updatedAt}`);
      
      // Test configuration structure
      const config = JSON.parse(documentariesConfig.content);
      console.log('\n📊 Configuration Structure:');
      console.log(`   - Hero Section: ${config.hero ? '✅' : '❌'}`);
      console.log(`   - Films: ${config.films ? `✅ (${config.films.items.length} films)` : '❌'}`);
      console.log(`   - Festival Selections: ${config.festivalSelections ? `✅ (${config.festivalSelections.festivals.length} festivals)` : '❌'}`);
      
      // Test specific content
      if (config.hero) {
        console.log('\n🎯 Hero Section Content:');
        console.log(`   - Title: "${config.hero.title}"`);
        console.log(`   - Subtitle: "${config.hero.subtitle}"`);
        console.log(`   - Badge: "${config.hero.badge}"`);
        console.log(`   - Description: "${config.hero.description.substring(0, 50)}..."`);
      }
      
      if (config.films && config.films.items.length > 0) {
        console.log('\n🎬 Films Collection:');
        config.films.items.forEach((film, index) => {
          console.log(`   ${index + 1}. ${film.title}`);
          console.log(`      - Duration: ${film.duration}`);
          console.log(`      - Type: ${film.type}`);
          console.log(`      - Year: ${film.year}`);
          console.log(`      - Description: ${film.desc.substring(0, 50)}...`);
        });
      }
      
      if (config.festivalSelections && config.festivalSelections.festivals.length > 0) {
        console.log('\n🏆 Festival Selections:');
        config.festivalSelections.festivals.forEach((festival, index) => {
          console.log(`   ${index + 1}. ${festival.name}`);
          console.log(`      - Recognition: ${festival.subtitle}`);
          console.log(`      - Year: ${festival.year}`);
        });
        
        console.log('\n📊 Festival Statistics:');
        console.log(`   - Awards: ${config.festivalSelections.stats.awards}`);
        console.log(`   - Selections: ${config.festivalSelections.stats.selections}`);
      }
      
    } else {
      console.log('❌ Documentaries configuration not found');
      return;
    }
    
    // Test 2: API endpoint test
    console.log('\n📋 Test 2: Testing API endpoint...');
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5000/api/page-config/documentaries');
      
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
      'metadata', 'hero', 'films', 'festivalSelections'
    ];
    
    const config = JSON.parse(documentariesConfig.content);
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
    
    // Check films
    if (config.films && config.films.items) {
      config.films.items.forEach((film, index) => {
        if (!film.title || !film.duration || !film.type || !film.year || !film.desc || !film.image) {
          console.log(`   ❌ Film ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Films validation passed (${config.films.items.length} films)`);
      }
    }
    
    // Check festival selections
    if (config.festivalSelections && config.festivalSelections.festivals) {
      config.festivalSelections.festivals.forEach((festival, index) => {
        if (!festival.name || !festival.subtitle || !festival.year) {
          console.log(`   ❌ Festival ${index + 1}: Missing required fields`);
          validationErrors++;
        }
      });
      if (validationErrors === 0) {
        console.log(`   ✅ Festival selections validation passed (${config.festivalSelections.festivals.length} festivals)`);
      }
    }
    
    // Check festival stats
    if (config.festivalSelections && config.festivalSelections.stats) {
      const stats = config.festivalSelections.stats;
      if (typeof stats.awards === 'number' && typeof stats.selections === 'number') {
        console.log(`   ✅ Festival statistics validation passed (${stats.awards} awards, ${stats.selections} selections)`);
      } else {
        console.log(`   ❌ Festival statistics: Invalid data types`);
        validationErrors++;
      }
    }
    
    console.log(`\n📊 Validation Result: ${validationErrors === 0 ? '✅ All tests passed' : `❌ ${validationErrors} errors found`}`);
    
    console.log('\n🎉 Documentaries Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Start the frontend server: npm run dev');
    console.log('   3. Visit: http://localhost:3000/documentaries');
    console.log('   4. Test the admin panel: http://localhost:3000/admin/page-config');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
}

// Run the test
testDocumentariesIntegration();