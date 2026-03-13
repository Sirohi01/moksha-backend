const mongoose = require('mongoose');

const expansionRequestSchema = new mongoose.Schema({
  // Requester Details
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
  organization: String,
  position: String,

  // Location Details
  requestedCity: {
    type: String,
    required: [true, 'Requested city is required'],
    trim: true
  },
  requestedState: {
    type: String,
    required: [true, 'Requested state is required'],
    trim: true
  },
  region: String,
  population: Number,
  currentServices: String,
  needAssessment: String,

  // Support Details
  localSupport: {
    type: String,
    enum: ['individual', 'organization', 'government', 'community', 'multiple'],
    required: [true, 'Local support type is required']
  },
  supportDetails: String,
  volunteerAvailability: String,
  fundingSupport: String,
  
  // Justification
  whyNeeded: {
    type: String,
    required: [true, 'Justification is required'],
    trim: true
  },
  expectedImpact: String,
  challenges: String,
  timeline: String,

  // System Fields
  requestId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'feasibility_study', 'approved', 'rejected', 'on_hold'],
    default: 'submitted'
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
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  approvalDate: Date,
  rejectionReason: String,
  feasibilityScore: Number, // 1-10 scale
  estimatedCost: Number,
  estimatedTimeline: String,
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate request ID before saving
expansionRequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.requestId = `EXP-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('ExpansionRequest', expansionRequestSchema);