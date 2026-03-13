const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
    trim: true
  },

  // Feedback Details
  feedbackType: {
    type: String,
    required: [true, 'Feedback type is required'],
    enum: ['service_experience', 'website', 'volunteer', 'donation', 'complaint', 'suggestion', 'appreciation', 'other']
  },
  serviceUsed: {
    type: String,
    enum: ['cremation', 'report', 'volunteer', 'donation', 'helpline', 'website', 'other']
  },
  experienceRating: {
    type: Number,
    required: [true, 'Experience rating is required'],
    min: 1,
    max: 5
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
  suggestions: {
    type: String,
    trim: true
  },
  wouldRecommend: {
    type: String,
    required: [true, 'Recommendation is required'],
    enum: ['yes', 'maybe', 'no']
  },

  // Consent
  consentToPublish: {
    type: Boolean,
    default: false
  },

  // System Fields
  referenceNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'responded', 'closed'],
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
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate reference number before saving
feedbackSchema.pre('save', async function(next) {
  if (!this.referenceNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.referenceNumber = `FB-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Indexes
feedbackSchema.index({ referenceNumber: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ experienceRating: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);