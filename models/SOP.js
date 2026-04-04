const mongoose = require('mongoose');

const sopSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'SOP title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'SOP slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    required: [true, 'SOP category is required'],
    enum: ['MCD', 'Ambulance', 'Logistics', 'Administration', 'Personnel', 'Medical', 'Legal', 'General'],
    default: 'General'
  },
  content: {
    type: String,
    required: [true, 'SOP content is required']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isCritical: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  version: {
    type: Number,
    default: 1
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});
sopSchema.index({ slug: 1 });
sopSchema.index({ category: 1 });
sopSchema.index({ status: 1 });
sopSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('SOP', sopSchema);
