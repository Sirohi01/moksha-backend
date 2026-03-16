const fetch = require('node-fetch');

async function testReportIntegration() {
  console.log('🧪 Testing Report Page Integration...\n');
  
  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/page-config/report');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   - Page: ${data.data.pageName}`);
      console.log(`   - Version: ${data.data.version}`);
      console.log(`   - Last Modified: ${new Date(data.data.lastModified).toLocaleString()}`);
      
      // Check key sections
      const config = data.data.config;
      console.log('\n2. Checking configuration sections...');
      
      const requiredSections = ['hero', 'success', 'sections', 'labels', 'placeholders', 'selectOptions', 'emergency'];
      let allSectionsPresent = true;
      
      requiredSections.forEach(section => {
        if (config[section]) {
          console.log(`   ✅ ${section} section present`);
        } else {
          console.log(`   ❌ ${section} section missing`);
          allSectionsPresent = false;
        }
      });
      
      // Check form sections
      console.log('\n3. Checking form sections...');
      if (config.sections && Array.isArray(config.sections)) {
        console.log(`   ✅ ${config.sections.length} form sections configured`);
        config.sections.forEach((section, index) => {
          console.log(`   - Section ${section.number}: ${section.title}`);
        });
      } else {
        console.log('   ❌ Form sections missing or invalid');
        allSectionsPresent = false;
      }
      
      // Check form labels
      console.log('\n4. Checking form labels...');
      if (config.labels && typeof config.labels === 'object') {
        const labelCount = Object.keys(config.labels).length;
        console.log(`   ✅ Form labels complete (${labelCount} labels)`);
        console.log(`   - Key labels: ${Object.keys(config.labels).slice(0, 5).join(', ')}...`);
      } else {
        console.log('   ❌ Form labels missing or invalid');
        allSectionsPresent = false;
      }
      
      // Check select options
      console.log('\n5. Checking select options...');
      if (config.selectOptions && config.selectOptions.states && Array.isArray(config.selectOptions.states)) {
        console.log('   ✅ Select options configuration complete');
        console.log(`   - States: ${config.selectOptions.states.length} states`);
        console.log(`   - Gender options: ${config.selectOptions.gender ? config.selectOptions.gender.length : 0} options`);
        console.log(`   - Location types: ${config.selectOptions.locationType ? config.selectOptions.locationType.length : 0} options`);
      } else {
        console.log('   ❌ Select options configuration incomplete');
        allSectionsPresent = false;
      }
      
      // Check emergency contact
      console.log('\n6. Checking emergency contact...');
      if (config.emergency && config.emergency.phoneNumber && config.emergency.title) {
        console.log('   ✅ Emergency contact configuration complete');
        console.log(`   - Phone: ${config.emergency.phoneNumber}`);
        console.log(`   - Title: ${config.emergency.title}`);
      } else {
        console.log('   ❌ Emergency contact configuration incomplete');
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
testReportIntegration();