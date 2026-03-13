const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter Details
  reporterName: {
    type: String,
    trim: true
  },
  reporterPhone: {
    type: String,
    required: [true, 'Reporter phone is required'],
    trim: true
  },
  reporterEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  reporterAddress: {
    type: String,
    trim: true
  },
  reporterRelation: {
    type: String,
    enum: ['witness', 'relative', 'police', 'hospital', 'passerby', 'other'],
    trim: true
  },

  // Location Details
  exactLocation: {
    type: String,
    required: [true, 'Exact location is required'],
    trim: true
  },
  landmark: String,
  area: {
    type: String,
    required: [true, 'Area is required'],
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
  locationType: {
    type: String,
    required: [true, 'Location type is required'],
    enum: ['road', 'hospital', 'home', 'public_place', 'river', 'railway', 'forest', 'other']
  },
  gpsCoordinates: String,

  // Time Details
  dateFound: {
    type: Date,
    required: [true, 'Date found is required']
  },
  timeFound: {
    type: String,
    required: [true, 'Time found is required']
  },
  approximateDeathTime: String,

  // Body Details
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['male', 'female', 'other', 'unknown']
  },
  approximateAge: String,
  height: String,
  weight: String,
  complexion: String,
  hairColor: String,
  eyeColor: String,

  // Identification Marks
  tattoos: String,
  scars: String,
  birthmarks: String,
  jewelry: String,
  clothing: String,
  personalBelongings: String,

  // Physical Condition
  bodyCondition: {
    type: String,
    required: [true, 'Body condition is required'],
    enum: ['recent', 'decomposed', 'advanced', 'skeletal', 'unknown']
  },
  visibleInjuries: String,
  causeOfDeathSuspected: String,

  // Authority Details
  policeInformed: {
    type: Boolean,
    default: false
  },
  policeStationName: String,
  firNumber: String,
  hospitalName: String,
  postMortemDone: {
    type: Boolean,
    default: false
  },

  // Additional Information
  identityDocumentsFound: {
    type: Boolean,
    default: false
  },
  documentDetails: String,
  suspectedIdentity: String,
  familyContacted: {
    type: Boolean,
    default: false
  },
  additionalNotes: String,

  // Witness Information
  witnessName: String,
  witnessPhone: String,
  witnessAddress: String,

  // Document Uploads (Optional)
  bplCardNumber: String,
  bplCardPhoto: String, // Cloudinary URL
  aadhaarNumber: String,
  aadhaarPhoto: String, // Cloudinary URL
  nocDetails: String,
  nocPhoto: String, // Cloudinary URL
  panNumber: String,
  panPhoto: String, // Cloudinary URL

  // Consent
  agreeToTerms: {
    type: Boolean,
    required: [true, 'Terms agreement is required']
  },
  consentToShare: {
    type: Boolean,
    required: [true, 'Consent to share is required']
  },

  // System Fields
  caseNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'high'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  responseTime: Date,
  resolvedAt: Date,
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

// Generate case number before saving
reportSchema.pre('save', async function(next) {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.caseNumber = `MS-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes for better performance
reportSchema.index({ caseNumber: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ dateFound: -1 });
reportSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Report', reportSchema);