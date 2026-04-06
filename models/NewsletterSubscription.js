const mongoose = require('mongoose');

const NewsletterSubscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10,15}$/, 'Please provide a valid phone number (without + prefix)']
  },
  communicationPreference: {
    type: String,
    enum: ['email', 'whatsapp', 'both'],
    default: 'email'
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: 'blog_page'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsletterSubscription', NewsletterSubscriptionSchema);
