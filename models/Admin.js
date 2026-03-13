const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminSchema = new mongoose.Schema({
  // Personal Details
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  
  // Role & Permissions
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['technical_support', 'seo_team', 'media_team', 'manager', 'super_admin'],
    default: 'technical_support'
  },
  permissions: [{
    type: String,
    enum: [
      // Form Management
      'view_reports', 'manage_reports',
      'view_feedback', 'manage_feedback',
      'view_volunteers', 'manage_volunteers',
      'view_contacts', 'manage_contacts',
      'view_donations', 'manage_donations',
      'view_board_applications', 'manage_board_applications',
      'view_legacy_requests', 'manage_legacy_requests',
      'view_scheme_applications', 'manage_scheme_applications',
      'view_expansion_requests', 'manage_expansion_requests',
      
      // Content Management
      'manage_content', 'manage_seo', 'manage_media',
      'media_read', 'media_write', 'media_delete', 'media_approve', 'media_publish',
      
      // User Management
      'view_users', 'manage_users', 'manage_roles',
      
      // System Management
      'view_analytics', 'manage_system', 'view_logs',
      
      // Super Admin
      'super_admin'
    ]
  }],
  
  // Security
  isActive: {
    type: Boolean,
    default: true
  },
  allowedIPs: [{
    type: String,
    validate: {
      validator: function(ip) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        // More comprehensive IPv6 regex
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip);
      },
      message: 'Invalid IP address format'
    }
  }],
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Profile
  avatar: String, // Cloudinary URL
  department: String,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  
  // Tokens
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Two Factor Authentication
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for account locked
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save middleware to set default permissions based on role
adminSchema.pre('save', function(next) {
  if (!this.isModified('role')) return next();
  
  // Set default permissions based on role
  switch (this.role) {
    case 'technical_support':
      this.permissions = [
        'view_reports', 'manage_reports',
        'view_feedback', 'manage_feedback',
        'view_volunteers', 'manage_volunteers',
        'view_contacts', 'manage_contacts',
        'view_donations', 'manage_donations',
        'view_board_applications', 'manage_board_applications',
        'view_legacy_requests', 'manage_legacy_requests',
        'view_scheme_applications', 'manage_scheme_applications',
        'view_expansion_requests', 'manage_expansion_requests'
      ];
      break;
      
    case 'seo_team':
      this.permissions = [
        'view_reports', 'view_feedback', 'view_volunteers',
        'view_contacts', 'view_donations',
        'manage_content', 'manage_seo'
      ];
      break;
      
    case 'media_team':
      this.permissions = [
        'view_reports', 'view_feedback', 'view_volunteers',
        'manage_media', 'manage_content'
      ];
      break;
      
    case 'manager':
      this.permissions = [
        'view_reports', 'manage_reports',
        'view_feedback', 'manage_feedback',
        'view_volunteers', 'manage_volunteers',
        'view_contacts', 'manage_contacts',
        'view_donations', 'manage_donations',
        'view_board_applications', 'manage_board_applications',
        'view_legacy_requests', 'manage_legacy_requests',
        'view_scheme_applications', 'manage_scheme_applications',
        'view_expansion_requests', 'manage_expansion_requests',
        'view_users', 'manage_users',
        'view_analytics', 'view_logs',
        'manage_content', 'manage_seo', 'manage_media'
      ];
      break;
      
    case 'super_admin':
      this.permissions = ['super_admin'];
      break;
  }
  
  next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
adminSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// Method to generate refresh token
adminSchema.methods.generateRefreshToken = function() {
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  this.refreshTokens.push({ token: refreshToken });
  return refreshToken;
};

// Method to handle failed login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to check if user has permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.permissions.includes('super_admin')) return true;
  return this.permissions.includes(permission);
};

// Method to check if IP is allowed
adminSchema.methods.isIPAllowed = function(ip) {
  if (!this.allowedIPs || this.allowedIPs.length === 0) return true;
  return this.allowedIPs.includes(ip);
};

// Static method to get reasons for account lock
adminSchema.statics.getFailedLoginReasons = function() {
  return {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
  };
};

// Index for performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

module.exports = mongoose.model('Admin', adminSchema);