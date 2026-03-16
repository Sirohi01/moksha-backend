const fetch = require('node-fetch');

async function testBoardIntegration() {
  console.log('🧪 Testing Board Page Integration...\n');
  
  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/page-config/board');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   - Page: ${data.data.pageName}`);
      console.log(`   - Version: ${data.data.version}`);
      console.log(`   - Last Modified: ${new Date(data.data.lastModified).toLocaleString()}`);
      
      // Check key sections
      const config = data.data.config;
      console.log('\n2. Checking configuration sections...');
      
      const requiredSections = ['hero', 'leadership', 'joinCard', 'stats', 'labels'];
      let allSectionsPresent = true;
      
      requiredSections.forEach(section => {
        if (config[section]) {
          console.log(`   ✅ ${section} section present`);
        } else {
          console.log(`   ❌ ${section} section missing`);
          allSectionsPresent = false;
        }
      });
      
      // Check leadership data
      console.log('\n3. Checking leadership data...');
      if (config.leadership && Array.isArray(config.leadership)) {
        console.log(`   ✅ ${config.leadership.length} board members configured`);
        config.leadership.forEach((member, index) => {
          console.log(`   - ${member.name}: ${member.role}`);
        });
      } else {
        console.log('   ❌ Leadership data missing or invalid');
        allSectionsPresent = false;
      }
      
      // Check stats configuration
      console.log('\n4. Checking stats configuration...');
      if (config.stats && Array.isArray(config.stats)) {
        console.log('   ✅ Stats configuration complete');
        console.log(`   - Statistics: ${config.stats.length} metrics`);
        config.stats.forEach(stat => {
          console.log(`     • ${stat.number} ${stat.label}`);
        });
      } else {
        console.log('   ❌ Stats configuration incomplete');
        allSectionsPresent = false;
      }
      
      // Check join card
      console.log('\n5. Checking join card configuration...');
      if (config.joinCard && config.joinCard.title && config.joinCard.buttonHref) {
        console.log('   ✅ Join card configuration complete');
        console.log(`   - Title: ${config.joinCard.title}`);
        console.log(`   - Button Link: ${config.joinCard.buttonHref}`);
      } else {
        console.log('   ❌ Join card configuration incomplete');
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
testBoardIntegration();