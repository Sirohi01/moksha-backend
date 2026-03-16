const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedMokshaAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'officialmanishsirohi.01@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Moksha admin user already exists');
      console.log('📧 Email: officialmanishsirohi.01@gmail.com');
      console.log('🔑 Password: admin@123');
      process.exit(0);
    }

    // Create moksha admin user
    const admin = await Admin.create({
      name: 'Moksha Admin',
      email: 'officialmanishsirohi.01@gmail.com',
      phone: '+919773992516',
      password: 'admin@123',
      role: 'super_admin',
      isActive: true
    });

    console.log('🎉 Moksha Admin created successfully!');
    console.log('📧 Email: officialmanishsirohi.01@gmail.com');
    console.log('🔑 Password: admin@123');
    console.log('👤 Role: super_admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedMokshaAdmin();