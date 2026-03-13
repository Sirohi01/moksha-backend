const mongoose = require('mongoose');

const boardApplicationSchema = new mongoose.Schema({
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
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: String,

  // Professional Details
  currentPosition: {
    type: String,
    required: [true, 'Current position is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: 0
  },
  expertise: [{
    type: String,
    enum: ['finance', 'legal', 'healthcare', 'social_work', 'technology', 'marketing', 'operations', 'fundraising', 'governance', 'other']
  }],
  qualifications: {
    type: String,
    required: [true, 'Qualifications are required'],
    trim: true
  },

  // Board Interest
  positionInterested: {
    type: String,
    required: [true, 'Position interested is required'],
    enum: ['board_member', 'advisory_member', 'treasurer', 'secretary', 'any']
  },
  motivationStatement: {
    type: String,
    required: [true, 'Motivation statement is required'],
    trim: true
  },
  previousBoardExperience: String,
  timeCommitment: {
    type: String,
    required: [true, 'Time commitment is required'],
    enum: ['5_hours_month', '10_hours_month', '15_hours_month', '20_plus_hours_month']
  },

  // References
  references: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: String,
    organization: String,
    phone: String,
    email: String,
    relationship: String
  }],

  // Documents
  resumeUrl: String, // Cloudinary URL
  coverLetterUrl: String, // Cloudinary URL
  
  // System Fields
  applicationId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'interview_scheduled', 'approved', 'rejected'],
    default: 'submitted'
  },
  notes: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date
}, {
  timestamps: true
});

// Generate applicationId before saving
boardApplicationSchema.pre('save', function(next) {
  if (!this.applicationId) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.applicationId = `BA-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('BoardApplication', boardApplicationSchema);