const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const Admin = require('./models/Admin');
const { getAvailableIPs } = require('./utils/networkUtils');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function registerAdmin() {
  console.log('🔐 Admin Registration Tool');
  console.log('==========================\n');

  // Show available IPs
  console.log('🌐 Available Network IPs:');
  const availableIPs = getAvailableIPs();
  console.log('- 127.0.0.1 (localhost)');
  console.log('- 0.0.0.0 (any IP - less secure)');
  availableIPs.forEach((ip, index) => {
    console.log(`- ${ip.address} (${ip.interface} - ${ip.type})`);
  });
  console.log('');

  try {
    // Get admin details
    const name = await askQuestion('Enter admin name: ');
    const email = await askQuestion('Enter admin email: ');
    const phone = await askQuestion('Enter admin phone: ');
    const password = await askQuestion('Enter password (min 6 chars): ');
    
    console.log('\nAvailable roles:');
    console.log('1. technical_support');
    console.log('2. seo_team');
    console.log('3. media_team');
    console.log('4. manager');
    const roleChoice = await askQuestion('Select role (1-4): ');
    
    const roles = ['technical_support', 'seo_team', 'media_team', 'manager'];
    const role = roles[parseInt(roleChoice) - 1] || 'technical_support';

    const ipInput = await askQuestion('Enter allowed IPs (comma-separated, or press Enter for any IP): ');
    const allowedIPs = ipInput.trim() ? ipInput.split(',').map(ip => ip.trim()) : ['0.0.0.0'];

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!');
      process.exit(1);
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      phone,
      password,
      role,
      allowedIPs
    });

    console.log('\n✅ Admin registered successfully!');
    console.log('Admin Details:');
    console.log(`- ID: ${admin._id}`);
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Allowed IPs: ${admin.allowedIPs.join(', ')}`);
    console.log(`- Permissions: ${admin.permissions.join(', ')}`);

  } catch (error) {
    console.error('❌ Registration failed:', error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

registerAdmin();