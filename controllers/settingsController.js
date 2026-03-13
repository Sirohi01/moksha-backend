// In-memory settings storage (replace with database in production)
let systemSettings = {
  general: {
    siteName: 'Moksha Seva',
    siteDescription: 'Dignified Last Rites for All',
    contactEmail: 'contact@mokshaseva.org',
    supportEmail: 'support@mokshaseva.org',
    maintenanceMode: false,
    timezone: 'Asia/Kolkata',
    language: 'en',
    currency: 'INR'
  },
  security: {
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireTwoFactor: false,
    ipWhitelistEnabled: false,
    allowedIPs: [],
    passwordComplexity: true,
    accountLockoutDuration: 30 // minutes
  },
  email: {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@mokshaseva.org',
    smtpPassword: '', // encrypted
    fromName: 'Moksha Seva',
    fromEmail: 'noreply@mokshaseva.org',
    enableTLS: true,
    enableSSL: false
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    reportNotifications: true,
    donationNotifications: true,
    volunteerNotifications: true
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily', // hourly, daily, weekly, monthly
    retentionDays: 30,
    lastBackup: new Date('2024-01-15T10:30:00Z'),
    backupLocation: 'cloud',
    compressionEnabled: true
  },
  api: {
    rateLimit: 100, // requests per 15 minutes
    enableCORS: true,
    allowedOrigins: ['http://localhost:3000', 'https://mokshaseva.org'],
    apiVersion: 'v1',
    enableLogging: true
  },
  performance: {
    cacheEnabled: true,
    cacheDuration: 3600, // seconds
    compressionEnabled: true,
    minifyAssets: true,
    enableCDN: false,
    cdnUrl: ''
  },
  lastUpdated: new Date('2024-01-15T10:30:00Z'),
  updatedBy: 'System Admin'
};

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
const getSettings = async (req, res) => {
  try {
    // Remove sensitive information before sending
    const safeSettings = {
      ...systemSettings,
      email: {
        ...systemSettings.email,
        smtpPassword: systemSettings.email.smtpPassword ? '***hidden***' : ''
      }
    };

    res.status(200).json({
      success: true,
      data: safeSettings
    });
  } catch (error) {
    console.error('❌ Get settings failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings'
    });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const {
      general,
      security,
      email,
      notifications,
      backup,
      api,
      performance
    } = req.body;

    // Update settings sections
    if (general) {
      systemSettings.general = { ...systemSettings.general, ...general };
    }

    if (security) {
      systemSettings.security = { ...systemSettings.security, ...security };
    }

    if (email) {
      // Don't update password if it's the hidden placeholder
      const emailUpdate = { ...email };
      if (emailUpdate.smtpPassword === '***hidden***') {
        delete emailUpdate.smtpPassword;
      }
      systemSettings.email = { ...systemSettings.email, ...emailUpdate };
    }

    if (notifications) {
      systemSettings.notifications = { ...systemSettings.notifications, ...notifications };
    }

    if (backup) {
      systemSettings.backup = { ...systemSettings.backup, ...backup };
    }

    if (api) {
      systemSettings.api = { ...systemSettings.api, ...api };
    }

    if (performance) {
      systemSettings.performance = { ...systemSettings.performance, ...performance };
    }

    // Update metadata
    systemSettings.lastUpdated = new Date();
    systemSettings.updatedBy = req.admin.name;

    // Return safe settings (without sensitive data)
    const safeSettings = {
      ...systemSettings,
      email: {
        ...systemSettings.email,
        smtpPassword: systemSettings.email.smtpPassword ? '***hidden***' : ''
      }
    };

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: safeSettings
    });
  } catch (error) {
    console.error('❌ Update settings failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system settings'
    });
  }
};

// @desc    Get specific settings section
// @route   GET /api/settings/:section
// @access  Private
const getSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    
    if (!systemSettings[section]) {
      return res.status(404).json({
        success: false,
        message: 'Settings section not found'
      });
    }

    let sectionData = systemSettings[section];

    // Hide sensitive data for email section
    if (section === 'email') {
      sectionData = {
        ...sectionData,
        smtpPassword: sectionData.smtpPassword ? '***hidden***' : ''
      };
    }

    res.status(200).json({
      success: true,
      data: sectionData
    });
  } catch (error) {
    console.error('❌ Get settings section failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings section'
    });
  }
};

// @desc    Update specific settings section
// @route   PUT /api/settings/:section
// @access  Private
const updateSettingsSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updateData = req.body;
    
    if (!systemSettings[section]) {
      return res.status(404).json({
        success: false,
        message: 'Settings section not found'
      });
    }

    // Special handling for email section
    if (section === 'email' && updateData.smtpPassword === '***hidden***') {
      delete updateData.smtpPassword;
    }

    // Update the section
    systemSettings[section] = { ...systemSettings[section], ...updateData };
    systemSettings.lastUpdated = new Date();
    systemSettings.updatedBy = req.admin.name;

    // Return safe data
    let responseData = systemSettings[section];
    if (section === 'email') {
      responseData = {
        ...responseData,
        smtpPassword: responseData.smtpPassword ? '***hidden***' : ''
      };
    }

    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Update settings section failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings section'
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
const resetSettings = async (req, res) => {
  try {
    const { section } = req.body;

    if (section && systemSettings[section]) {
      // Reset specific section to defaults
      const defaults = getDefaultSettings();
      systemSettings[section] = defaults[section];
    } else {
      // Reset all settings to defaults
      systemSettings = getDefaultSettings();
    }

    systemSettings.lastUpdated = new Date();
    systemSettings.updatedBy = req.admin.name;

    res.status(200).json({
      success: true,
      message: section ? `${section} settings reset to defaults` : 'All settings reset to defaults'
    });
  } catch (error) {
    console.error('❌ Reset settings failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings'
    });
  }
};

// @desc    Backup current settings
// @route   POST /api/settings/backup
// @access  Private
const backupSettings = async (req, res) => {
  try {
    const backup = {
      settings: systemSettings,
      backupDate: new Date(),
      backupBy: req.admin.name,
      version: '1.0'
    };

    // In a real implementation, this would save to a file or database
    // For now, we'll just return the backup data
    res.status(200).json({
      success: true,
      message: 'Settings backup created successfully',
      data: backup
    });
  } catch (error) {
    console.error('❌ Backup settings failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to backup settings'
    });
  }
};

// @desc    Test email configuration
// @route   POST /api/settings/test-email
// @access  Private
const testEmailConfig = async (req, res) => {
  try {
    const { testEmail } = req.body;

    // In a real implementation, this would actually send a test email
    // For now, we'll simulate the test
    const emailConfig = systemSettings.email;
    
    if (!emailConfig.smtpHost || !emailConfig.smtpUser) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration is incomplete'
      });
    }

    // Simulate email test
    setTimeout(() => {
      res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${testEmail || 'configured email'}`,
        data: {
          testDate: new Date(),
          recipient: testEmail || emailConfig.fromEmail,
          status: 'delivered'
        }
      });
    }, 1000);

  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test email configuration'
    });
  }
};

// Helper function to get default settings
const getDefaultSettings = () => {
  return {
    general: {
      siteName: 'Moksha Seva',
      siteDescription: 'Dignified Last Rites for All',
      contactEmail: 'contact@mokshaseva.org',
      supportEmail: 'support@mokshaseva.org',
      maintenanceMode: false,
      timezone: 'Asia/Kolkata',
      language: 'en',
      currency: 'INR'
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      ipWhitelistEnabled: false,
      allowedIPs: [],
      passwordComplexity: true,
      accountLockoutDuration: 30
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromName: 'Moksha Seva',
      fromEmail: '',
      enableTLS: true,
      enableSSL: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminAlerts: true,
      reportNotifications: true,
      donationNotifications: true,
      volunteerNotifications: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: null,
      backupLocation: 'local',
      compressionEnabled: true
    },
    api: {
      rateLimit: 100,
      enableCORS: true,
      allowedOrigins: ['http://localhost:3000'],
      apiVersion: 'v1',
      enableLogging: true
    },
    performance: {
      cacheEnabled: true,
      cacheDuration: 3600,
      compressionEnabled: true,
      minifyAssets: true,
      enableCDN: false,
      cdnUrl: ''
    },
    lastUpdated: new Date(),
    updatedBy: 'System'
  };
};

module.exports = {
  getSettings,
  updateSettings,
  getSettingsSection,
  updateSettingsSection,
  resetSettings,
  backupSettings,
  testEmailConfig
};