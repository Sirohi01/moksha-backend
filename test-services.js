const fetch = require('node-fetch');

async function testServicesIntegration() {
  console.log('🧪 Testing Services Page Integration...\n');
  
  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/page-config/services');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   - Page: ${data.data.pageName}`);
      console.log(`   - Version: ${data.data.version}`);
      console.log(`   - Last Modified: ${new Date(data.data.lastModified).toLocaleString()}`);
      
      // Check key sections
      const config = data.data.config;
      console.log('\n2. Checking configuration sections...');
      
      const requiredSections = ['hero', 'mainServices', 'eligibility'];
      let allSectionsPresent = true;
      
      requiredSections.forEach(section => {
        if (config[section]) {
          console.log(`   ✅ ${section} section present`);
        } else {
          console.log(`   ❌ ${section} section missing`);
          allSectionsPresent = false;
        }
      });
      
      // Check main services data
      console.log('\n3. Checking main services data...');
      if (config.mainServices && Array.isArray(config.mainServices)) {
        console.log(`   ✅ ${config.mainServices.length} services configured`);
        config.mainServices.forEach((service, index) => {
          console.log(`   - ${service.title}: ${service.badge} (${service.includes.length} features)`);
        });
      } else {
        console.log('   ❌ Main services data missing or invalid');
        allSectionsPresent = false;
      }
      
      // Check eligibility configuration
      console.log('\n4. Checking eligibility configuration...');
      if (config.eligibility && config.eligibility.items && Array.isArray(config.eligibility.items)) {
        console.log('   ✅ Eligibility configuration complete');
        console.log(`   - Eligibility items: ${config.eligibility.items.length} categories`);
        config.eligibility.items.forEach(item => {
          console.log(`     • ${item.title}: ${item.desc.substring(0, 50)}...`);
        });
      } else {
        console.log('   ❌ Eligibility configuration incomplete');
        allSectionsPresent = false;
      }
      
      // Check hero section
      console.log('\n5. Checking hero section...');
      if (config.hero && config.hero.title && config.hero.description) {
        console.log('   ✅ Hero section configuration complete');
        console.log(`   - Title: ${config.hero.title} ${config.hero.titleHighlight}`);
        console.log(`   - Badge: ${config.hero.badge}`);
      } else {
        console.log('   ❌ Hero section configuration incomplete');
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
testServicesIntegration();