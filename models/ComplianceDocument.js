const mongoose = require('mongoose');

const complianceDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileSize: {
    type: String, // e.g., "1.2 MB"
    trim: true
  },
  validityDate: {
    type: String, // e.g., "2024-2027" or "Permanent"
    trim: true
  },
  documentType: {
    type: String,
    enum: ['certificate', 'report', 'legal', 'other'],
    default: 'certificate'
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'archived'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ComplianceDocument', complianceDocumentSchema);
