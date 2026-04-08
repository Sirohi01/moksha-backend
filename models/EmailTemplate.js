const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  body: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Authentication',
      'Donations',
      'Reporting',
      'Volunteers',
      'Support',
      'Tasks',
      'Applications',
      'Requests',
      'Schemes',
      'Expansion',
      'Feedback',
      'Admin Notifications',
      'Other'
    ],
    default: 'Other'
  },
  placeholders: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
