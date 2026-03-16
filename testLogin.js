const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const connectDB = require('./config/database');

const testLogin = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Testing admin login...');
    
    // Find the admin
    const admin = await Admin.findOne({ email: 'officialmanishsirohi.01@gmail.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }
    
    console.log('✅ Admin found:');
    console.log('   ID:', admin._id);
    console.log('   Name:', admin.name);
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Is Active:', admin.isActive);
    console.log('   Allowed IPs:', admin.allowedIPs);
    console.log('   Login Attempts:', admin.loginAttempts);
    console.log('   Is Locked:', admin.isLocked);
    console.log('   Lock Until:', admin.lockUntil);
    
    // Test password comparison
    const testPassword = 'your_password_here'; // Replace with actual password
    console.log('\n🔍 Testing password comparison...');
    
    // You can uncomment this line and add the actual password to test
    // const isMatch = await admin.comparePassword(testPassword);
    // console.log('Password match:', isMatch);
    
    // Test IP checking
    console.log('\n🔍 Testing IP checking...');
    const testIPs = ['127.0.0.1', '::1', 'localhost'];
    
    for (const ip of testIPs) {
      const isAllowed = admin.isIPAllowed(ip);
      console.log(`   IP ${ip}: ${isAllowed ? 'ALLOWED' : 'DENIED'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testLogin();