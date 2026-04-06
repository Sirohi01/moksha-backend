const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'Moksha Sewa' },
    siteUrl: { type: String, default: 'https://mokshasewa.org' },
    adminEmail: { type: String, default: 'admin@mokshasewa.org' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    language: { type: String, default: 'en' },
    maintenanceMode: { type: Boolean, default: false }
  },
  security: {
    sessionTimeout: { type: Number, default: 24 }, // hours
    maxLoginAttempts: { type: Number, default: 5 },
    passwordMinLength: { type: Number, default: 8 },
    requireTwoFactor: { type: Boolean, default: false },
    ipWhitelisting: { type: Boolean, default: false },
    allowedIPs: [{ type: String }]
  },
  email: {
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPassword: { type: String, default: '' },
    fromEmail: { type: String, default: '' },
    fromName: { type: String, default: 'Moksha Sewa' }
  },
  razorpay: {
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    enableTestMode: { type: Boolean, default: true }
  },
  features: {
    enableDonations: { type: Boolean, default: true },
    enableVolunteers: { type: Boolean, default: true },
    enableGallery: { type: Boolean, default: true },
    enablePress: { type: Boolean, default: true },
    enableAnalytics: { type: Boolean, default: true }
  },
  updatedBy: { type: String },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
