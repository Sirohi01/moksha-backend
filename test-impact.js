const fetch = require('node-fetch');

async function testImpactIntegration() {
  console.log('🧪 Testing Impact Page Integration...\n');
  
  try {
    // Test API endpoint
    console.log('1. Testing API endpoint...');
    const response = await fetch('http://localhost:5000/api/page-config/impact');
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API endpoint working');
      console.log(`   - Page: ${data.data.pageName}`);
      console.log(`   - Version: ${data.data.version}`);
      console.log(`   - Last Modified: ${new Date(data.data.lastModified).toLocaleString()}`);
      
      // Check key sections
      const config = data.data.config;
      console.log('\n2. Checking configuration sections...');
      
      const requiredSections = ['hero', 'impactStats', 'growthTimeline', 'testimonials', 'callToAction'];
      let allSectionsPresent = true;
      
      requiredSections.forEach(section => {
        if (config[section]) {
          console.log(`   ✅ ${section} section present`);
        } else {
          console.log(`   ❌ ${section} section missing`);
          allSectionsPresent = false;
        }
      });
      
      // Check hero section
      console.log('\n3. Checking hero section...');
      if (config.hero && config.hero.keyStats && config.hero.actions) {
        console.log('   ✅ Hero section complete');
        console.log(`   - Title: ${config.hero.title} ${config.hero.highlightText}`);
        console.log(`   - Key stats: ${Object.keys(config.hero.keyStats).length} metrics`);
        console.log(`   - Actions: ${Object.keys(config.hero.actions).length} buttons`);
      } else {
        console.log('   ❌ Hero section incomplete');
        allSectionsPresent = false;
      }
      
      // Check impact statistics
      console.log('\n4. Checking impact statistics...');
      if (config.impactStats && config.impactStats.stats && Array.isArray(config.impactStats.stats)) {
        console.log('   ✅ Impact statistics complete');
        console.log(`   - Statistics: ${config.impactStats.stats.length} metrics`);
        config.impactStats.stats.forEach((stat, index) => {
          console.log(`     • ${stat.number} ${stat.label}`);
        });
      } else {
        console.log('   ❌ Impact statistics incomplete');
        allSectionsPresent = false;
      }
      
      // Check growth timeline
      console.log('\n5. Checking growth timeline...');
      if (config.growthTimeline && config.growthTimeline.yearlyData && Array.isArray(config.growthTimeline.yearlyData)) {
        console.log('   ✅ Growth timeline complete');
        console.log(`   - Yearly data: ${config.growthTimeline.yearlyData.length} years`);
        console.log(`   - Highlighted years: ${config.growthTimeline.highlightedYears ? config.growthTimeline.highlightedYears.length : 0} years`);
      } else {
        console.log('   ❌ Growth timeline incomplete');
        allSectionsPresent = false;
      }
      
      // Check testimonials
      console.log('\n6. Checking testimonials...');
      if (config.testimonials && config.testimonials.testimonials && Array.isArray(config.testimonials.testimonials)) {
        console.log('   ✅ Testimonials complete');
        console.log(`   - Testimonials: ${config.testimonials.testimonials.length} testimonials`);
        config.testimonials.testimonials.forEach((testimonial, index) => {
          console.log(`     • ${testimonial.author} - ${testimonial.role}`);
        });
      } else {
        console.log('   ❌ Testimonials incomplete');
        allSectionsPresent = false;
      }
      
      // Check call to action
      console.log('\n7. Checking call to action...');
      if (config.callToAction && config.callToAction.actions) {
        console.log('   ✅ Call to action complete');
        console.log(`   - Title: ${config.callToAction.title}`);
        console.log(`   - Actions: ${Object.keys(config.callToAction.actions).length} buttons`);
      } else {
        console.log('   ❌ Call to action incomplete');
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
testImpactIntegration();