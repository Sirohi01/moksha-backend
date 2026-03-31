const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  // Registration Type
  registrationType: {
    type: String,
    required: [true, 'Registration type is required'],
    enum: ['individual', 'group']
  },
  photo: String,

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
  alternatePhone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },

  // Address
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
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },

  // Professional Details
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
    trim: true
  },
  organization: {
    type: String,
    trim: true
  },
  experience: {
    type: String,
    enum: ['no_experience', 'some_experience', 'experienced', 'expert']
  },
  skills: {
    type: String,
    trim: true
  },

  // Social Media
  facebookProfile: String,
  instagramHandle: String,
  twitterHandle: String,
  linkedinProfile: String,

  // Volunteer Details
  volunteerTypes: [{
    type: String,
    enum: ['field_volunteer', 'transport_logistics', 'documentation', 'counseling', 'medical_support', 'fundraising', 'awareness', 'tech_support', 'event_coordinator', 'training']
  }],
  availability: {
    type: String,
    required: [true, 'Availability is required'],
    enum: ['weekdays_morning', 'weekdays_evening', 'weekends', 'full_time', 'on_call', 'flexible']
  },
  preferredLocation: String,
  hasVehicle: {
    type: Boolean,
    default: false
  },
  vehicleType: String,
  languagesKnown: String,

  // Group Details (if group registration)
  groupName: String,
  groupSize: Number,
  groupType: {
    type: String,
    enum: ['corporate', 'college', 'school', 'ngo', 'community', 'religious', 'other']
  },
  groupLeaderName: String,
  groupLeaderPhone: String,
  groupLeaderEmail: String,
  groupMembers: [{
    name: String,
    role: String,
    contact: String,
    photo: String
  }],

  // Emergency Contact
  emergencyContactName: String,
  emergencyContactPhone: String,
  emergencyContactRelation: String,

  // Additional
  whyVolunteer: String,
  previousVolunteerWork: String,
  medicalConditions: String,

  // Agreements
  agreeToTerms: {
    type: Boolean,
    required: [true, 'Terms agreement is required']
  },
  agreeToBackgroundCheck: {
    type: Boolean,
    required: [true, 'Background check agreement is required']
  },

  // System Fields
  volunteerId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive', 'active'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: Date,
  rejectionReason: String,
  trainingCompleted: {
    type: Boolean,
    default: false
  },
  trainingCompletedAt: Date,
  backgroundCheckStatus: {
    type: String,
    enum: ['pending', 'cleared', 'failed'],
    default: 'pending'
  },
  hoursContributed: {
    type: Number,
    default: 0
  },
  lastActiveDate: Date,
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

// Generate volunteer ID before saving
volunteerSchema.pre('save', async function(next) {
  if (!this.volunteerId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.volunteerId = `VOL-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
volunteerSchema.index({ volunteerId: 1 });
volunteerSchema.index({ status: 1 });
volunteerSchema.index({ city: 1, state: 1 });
volunteerSchema.index({ volunteerTypes: 1 });
volunteerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Volunteer', volunteerSchema);