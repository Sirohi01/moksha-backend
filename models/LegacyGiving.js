const mongoose = require('mongoose');

const legacyGivingSchema = new mongoose.Schema({
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
  dateOfBirth: Date,
  address: String,
  city: String,
  state: String,
  pincode: String,

  // Legacy Details
  legacyType: {
    type: String,
    required: [true, 'Legacy type is required'],
    enum: ['will_bequest', 'life_insurance', 'retirement_plan', 'charitable_trust', 'other']
  },
  estimatedValue: String,
  timeframe: {
    type: String,
    enum: ['immediate', '1_2_years', '3_5_years', '5_plus_years', 'uncertain']
  },
  specificPurpose: String,
  additionalInfo: String,

  // Contact Preferences
  preferredContact: {
    type: String,
    enum: ['phone', 'email', 'mail', 'in_person'],
    default: 'email'
  },
  bestTimeToContact: String,
  
  // System Fields
  requestId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in_discussion', 'completed', 'declined'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  followUpDate: Date,
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
legacyGivingSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.requestId = `LG-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LegacyGiving', legacyGivingSchema);