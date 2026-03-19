const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailConnection = async () => {
  console.log('🧪 Testing Email Configuration...');
  console.log('📧 SMTP_HOST:', process.env.SMTP_HOST);
  console.log('📧 SMTP_PORT:', process.env.SMTP_PORT);
  console.log('📧 SMTP_USER:', process.env.SMTP_USER);
  console.log('📧 SMTP_PASS:', process.env.SMTP_PASS ? 'Set' : 'Missing');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    console.log('📧 Sending test email...');
    const result = await transporter.sendMail({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: process.env.SMTP_USER,
      subject: 'Test Email - Moksha Seva',
      html: '<h1>Test Email</h1><p>If you receive this, SMTP is working!</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('❌ Error Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Enable 2-Factor Authentication on Gmail');
      console.log('2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('3. Use App Password instead of regular password in .env');
      console.log('4. Update SMTP_PASS with the 16-character App Password');
    }
  }
};

testEmailConnection();