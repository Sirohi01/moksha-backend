const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  getSettingsSection,
  updateSettingsSection,
  resetSettings,
  backupSettings,
  testEmailConfig
} = require('../controllers/settingsController');

// @route   GET /api/settings
// @desc    Get system settings
// @access  Private
router.get('/', protect, authorize(['super_admin', 'manager']), getSettings);

// @route   PUT /api/settings
// @desc    Update system settings
// @access  Private
router.put('/', protect, authorize(['super_admin']), updateSettings);

// @route   GET /api/settings/:section
// @desc    Get specific settings section
// @access  Private
router.get('/:section', protect, authorize(['super_admin', 'manager']), getSettingsSection);

// @route   PUT /api/settings/:section
// @desc    Update specific settings section
// @access  Private
router.put('/:section', protect, authorize(['super_admin']), updateSettingsSection);

// @route   POST /api/settings/reset
// @desc    Reset settings to default
// @access  Private
router.post('/reset', protect, authorize(['super_admin']), resetSettings);

// @route   POST /api/settings/backup
// @desc    Backup current settings
// @access  Private
router.post('/backup', protect, authorize(['super_admin']), backupSettings);

// @route   POST /api/settings/test-email
// @desc    Test email configuration
// @access  Private
router.post('/test-email', protect, authorize(['super_admin', 'manager']), testEmailConfig);

module.exports = router;