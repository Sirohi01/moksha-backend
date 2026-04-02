const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: {
    type: String,
    required: true
  },

  // Activity Details
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'login', 'logout', 'password_change', 'password_reset',

      // Form Management
      'view_reports', 'update_report', 'delete_report',
      'view_feedback', 'update_feedback', 'delete_feedback',
      'view_volunteers', 'update_volunteer', 'delete_volunteer',
      'view_contacts', 'update_contact', 'delete_contact',
      'view_donations', 'update_donation', 'delete_donation',
      'view_board_applications', 'update_board_application', 'delete_board_application',
      'view_legacy_requests', 'update_legacy_request', 'delete_legacy_request',
      'view_scheme_applications', 'update_scheme_application', 'delete_scheme_application',
      'view_expansion_requests', 'update_expansion_request', 'delete_expansion_request',

      // Content Management
      'create_content', 'update_content', 'delete_content', 'update_seo', 'upload_media', 'delete_media', 'update_media',
      'create_press', 'update_press', 'delete_press',
      'create_documentary', 'update_documentary', 'delete_documentary',

      // User Management
      'create_user', 'update_user', 'delete_user', 'change_user_role',

      // System
      'view_dashboard', 'view_analytics', 'system_settings', 'export_data'
    ]
  },

  // Target Information
  targetType: {
    type: String,
    enum: ['report', 'feedback', 'volunteer', 'contact', 'donation', 'board_application',
      'legacy_request', 'scheme_application', 'expansion_request', 'user', 'system', 'content', 'gallery', 'press', 'documentary']
  },
  targetId: {
    type: String // Can be ObjectId or other identifier
  },
  targetName: String, // Human readable name/title

  // Request Information
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: String,

  // Activity Context
  description: String,
  oldValues: mongoose.Schema.Types.Mixed, // For update operations
  newValues: mongoose.Schema.Types.Mixed, // For update operations

  // Metadata
  duration: Number, // Request duration in ms
  status: {
    type: String,
    enum: ['success', 'failed', 'error'],
    default: 'success'
  },
  errorMessage: String,

  // Page/Session Information
  pageUrl: String,
  sessionId: String,
  timeSpent: Number, // Time spent on page in seconds
  clickCount: Number, // Number of clicks on page

  // Additional Data
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes for performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });
activityLogSchema.index({ ipAddress: 1 });
activityLogSchema.index({ createdAt: -1 });

// TTL index to automatically delete old logs after 1 year
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);