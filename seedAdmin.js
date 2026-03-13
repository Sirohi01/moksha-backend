const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@mokshaseva.org' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@mokshaseva.org');
      console.log('🔑 Password: admin@123');
      process.exit(0);
    }

    // Create super admin user
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@mokshaseva.org',
      phone: '+919568259784',
      password: 'admin@123',
      role: 'super_admin',
      isActive: true
    });

    console.log('🎉 Super Admin created successfully!');
    console.log('📧 Email: admin@mokshaseva.org');
    console.log('🔑 Password: admin@123');
    console.log('👤 Role: super_admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();