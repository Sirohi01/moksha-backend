const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true
  },
  otp: {
    type: String,
    required: [true, 'Please provide an OTP code']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Increased to 10 minutes for better user experience
  }
});

OTPSchema.index({ email: 1 });
OTPSchema.index({ mobile: 1 });

module.exports = mongoose.model('OTP', OTPSchema);
