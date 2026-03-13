const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Personal Details
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },

  // Additional Fields
  organization: String,
  city: String,
  state: String,
  inquiryType: {
    type: String,
    enum: ['general', 'volunteer', 'donation', 'partnership', 'media', 'support', 'other'],
    default: 'general'
  },

  // System Fields
  ticketNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'responded', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  responseMessage: String,
  respondedAt: Date,
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'social_media', 'referral'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Generate ticket number before saving
contactSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
contactSchema.index({ ticketNumber: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ inquiryType: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);