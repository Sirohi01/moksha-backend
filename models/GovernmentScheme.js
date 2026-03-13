const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema({
  // Applicant Details
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
  aadhaarNumber: String,
  address: String,
  city: String,
  state: String,
  pincode: String,

  // Scheme Details
  schemeType: {
    type: String,
    required: [true, 'Scheme type is required'],
    enum: ['central', 'state']
  },
  schemeName: {
    type: String,
    required: [true, 'Scheme name is required'],
    trim: true
  },
  beneficiaryType: {
    type: String,
    enum: ['individual', 'family', 'organization'],
    default: 'individual'
  },
  eligibilityCriteria: String,
  requiredDocuments: [String],
  applicationPurpose: String,
  
  // Financial Details
  incomeCategory: {
    type: String,
    enum: ['bpl', 'apl', 'middle_class', 'other']
  },
  monthlyIncome: Number,
  familySize: Number,
  
  // Documents
  documentsUploaded: [{
    documentType: String,
    documentUrl: String, // Cloudinary URL
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // System Fields
  applicationId: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'pending_documents'],
    default: 'submitted'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
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

// Generate application ID before saving
governmentSchemeSchema.pre('save', async function(next) {
  if (!this.applicationId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.applicationId = `GS-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);