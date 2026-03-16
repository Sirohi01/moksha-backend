const fetch = require('node-fetch');

async function testOurReachIntegration() {
  console.log('🧪 Testing Our Reach Page Integration...\n');
  
  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/page-config/our-reach');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   - Page: ${data.data.pageName}`);
      console.log(`   - Version: ${data.data.version}`);
      console.log(`   - Last Modified: ${new Date(data.data.lastModified).toLocaleString()}`);
      
      // Check key sections
      const config = data.data.config;
      console.log('\n2. Checking configuration sections...');
      
      const requiredSections = ['hero', 'regions', 'expansionCard', 'networkStats', 'form', 'modal', 'labels'];
      let allSectionsPresent = true;
      
      requiredSections.forEach(section => {
        if (config[section]) {
          console.log(`   ✅ ${section} section present`);
        } else {
          console.log(`   ❌ ${section} section missing`);
          allSectionsPresent = false;
        }
      });
      
      // Check regions data
      console.log('\n3. Checking regions data...');
      if (config.regions && Array.isArray(config.regions)) {
        console.log(`   ✅ ${config.regions.length} regions configured`);
        config.regions.forEach((region, index) => {
          console.log(`   - ${region.name}: ${region.cities.length} cities, ${region.stats}`);
        });
      } else {
        console.log('   ❌ Regions data missing or invalid');
        allSectionsPresent = false;
      }
      
      // Check form configuration
      console.log('\n4. Checking form configuration...');
      if (config.form && config.form.labels && config.form.placeholders) {
        console.log('   ✅ Form configuration complete');
        console.log(`   - Labels: ${Object.keys(config.form.labels).length} fields`);
        console.log(`   - States: ${config.form.states ? config.form.states.length : 0} states`);
      } else {
        console.log('   ❌ Form configuration incomplete');
        allSectionsPresent = false;
      }
      
      console.log('\n📊 Integration Test Results:');
      console.log(`   API Status: ✅ Working`);
      console.log(`   Configuration: ${allSectionsPresent ? '✅ Complete' : '❌ Incomplete'}`);
      console.log(`   Ready for Frontend: ${allSectionsPresent ? '✅ Yes' : '❌ No'}`);
      
    } else {
      console.log('❌ API endpoint failed');
      console.log('   Error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testOurReachIntegration();