const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donor Details
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
  address: String,
  city: String,
  state: String,
  pincode: String,
  country: {
    type: String,
    default: 'India'
  },

  // Donation Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  donationType: {
    type: String,
    enum: ['one_time', 'monthly', 'yearly'],
    default: 'one_time'
  },
  purpose: {
    type: String,
    enum: ['general', 'cremation_services', 'volunteer_support', 'infrastructure', 'emergency_fund', 'specific_campaign'],
    default: 'general'
  },
  campaignId: String, // If donation is for specific campaign
  isAnonymous: {
    type: Boolean,
    default: false
  },
  dedicatedTo: String, // In memory of someone
  message: String,

  // Payment Details
  paymentId: String, // Razorpay payment ID
  orderId: String, // Razorpay order ID
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet', 'bank_transfer'],
    required: [true, 'Payment method is required']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentGateway: {
    type: String,
    default: 'razorpay'
  },
  transactionId: String,
  paymentDate: Date,
  failureReason: String,

  // Tax & Receipt
  panNumber: String,
  needReceipt: {
    type: Boolean,
    default: true
  },
  receiptNumber: String,
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptUrl: String, // Cloudinary URL for receipt PDF
  taxExemptionClaimed: {
    type: Boolean,
    default: false
  },

  // Recurring Donation (if applicable)
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly']
  },
  nextPaymentDate: Date,
  recurringActive: {
    type: Boolean,
    default: true
  },
  parentDonationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  },

  // System Fields
  donationId: {
    type: String,
    unique: true
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'offline', 'campaign', 'event'],
    default: 'website'
  },
  ipAddress: String,
  userAgent: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Follow-up
  thankYouSent: {
    type: Boolean,
    default: false
  },
  thankYouSentAt: Date,
  followUpSent: {
    type: Boolean,
    default: false
  },
  followUpSentAt: Date,
  
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

// Generate donation ID before saving
donationSchema.pre('save', async function(next) {
  if (!this.donationId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.donationId = `DON-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Generate receipt number if payment is completed and receipt is needed
  if (this.paymentStatus === 'completed' && this.needReceipt && !this.receiptNumber) {
    const receiptCount = await this.constructor.countDocuments({ receiptNumber: { $exists: true } });
    this.receiptNumber = `RCP-${year}-${String(receiptCount + 1).padStart(5, '0')}`;
  }
  
  next();
});

// Indexes
donationSchema.index({ donationId: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ donationType: 1 });
donationSchema.index({ paymentDate: -1 });
donationSchema.index({ email: 1 });
donationSchema.index({ phone: 1 });

module.exports = mongoose.model('Donation', donationSchema);