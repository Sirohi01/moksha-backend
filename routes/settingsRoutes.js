const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  getPublicSettings,
  getSettingsSection,
  updateSettingsSection,
  resetSettings,
  backupSettings,
  testEmailConfig
} = require('../controllers/settingsController');
router.get('/public', getPublicSettings);
router.get('/', protect, authorize('super_admin', 'admin', 'manager'), getSettings);
router.put('/', protect, authorize('super_admin'), updateSettings);
router.get('/:section', protect, authorize('super_admin', 'admin', 'manager'), getSettingsSection);
router.put('/:section', protect, authorize('super_admin'), updateSettingsSection);
router.post('/reset', protect, authorize('super_admin'), resetSettings);
router.post('/backup', protect, authorize('super_admin'), backupSettings);
router.post('/test-email', protect, authorize('super_admin', 'admin', 'manager'), testEmailConfig);

module.exports = router;