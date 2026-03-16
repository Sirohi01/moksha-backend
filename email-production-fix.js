// Production Email Fix Script
require('dotenv').config();
const { testEmail } = require('./services/emailService');

const testProductionEmail = async () => {
  console.log('🧪 Testing Production Email Configuration...\n');
  
  try {
    console.log('📧 Current SMTP Settings:');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.FROM_EMAIL}\n`);
    
    console.log('⏳ Sending test email...');
    const startTime = Date.now();
    
    const result = await testEmail();
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Test Results:`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Success: ${result.success}`);
    
    if (result.success) {
      console.log(`   Message ID: ${result.messageId}`);
      console.log('\n✅ Email configuration is working!');
    } else {
      console.log(`   Error: ${result.error}`);
      console.log('\n❌ Email configuration failed!');
      
      // Suggest fixes
      console.log('\n🔧 Suggested Fixes:');
      console.log('1. Check Gmail App Password is valid');
      console.log('2. Verify 2FA is enabled on Gmail account');
      console.log('3. Try SendGrid for production reliability');
      console.log('4. Check firewall/network restrictions');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    
    if (error.message.includes('timeout')) {
      console.log('\n🚨 TIMEOUT ISSUE DETECTED:');
      console.log('- Gmail SMTP is being blocked or throttled');
      console.log('- Switch to SendGrid for production');
      console.log('- Or increase timeout values');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n🚨 CONNECTION ISSUE DETECTED:');
      console.log('- DNS resolution failed');
      console.log('- SMTP port blocked by firewall');
      console.log('- Check network connectivity');
    }
  }
};

// Run test
testProductionEmail();