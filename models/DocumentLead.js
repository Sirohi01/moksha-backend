const mongoose = require('mongoose');

const DocumentLeadSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComplianceDocument',
    required: true
  },
  documentTitle: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number']
  },
  pincode: {
    type: String
  },
  accessedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DocumentLead', DocumentLeadSchema);
