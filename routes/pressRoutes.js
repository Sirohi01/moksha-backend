const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const {
  getPressReleases,
  getPressRelease,
  createPressRelease,
  updatePressRelease,
  deletePressRelease,
  publishPressRelease,
  schedulePressRelease,
  addMediaCoverage,
  getPressAnalytics
} = require('../controllers/pressController');
const { logActivity } = require('../middleware/activityLogger');

// All routes require authentication
router.use(protect);

// @route   GET /api/press/analytics
// @desc    Get press analytics
// @access  Private (Media Team)
router.get('/analytics', checkPermission('media_read'), getPressAnalytics);

// @route   GET /api/press
// @desc    Get all press releases
// @access  Private (Media Team)
router.get('/', checkPermission('media_read'), getPressReleases);

// @route   POST /api/press
// @desc    Create new press release
// @access  Private (Media Team)
router.post('/', checkPermission('media_write'), logActivity('create_press', 'press', 'Drafted new official press communique'), createPressRelease);

// @route   GET /api/press/:id
// @desc    Get single press release
// @access  Private (Media Team)
router.get('/:id', checkPermission('media_read'), getPressRelease);

// @route   PUT /api/press/:id
// @desc    Update press release
// @access  Private (Media Team)
router.put('/:id', checkPermission('media_write'), logActivity('update_press', 'press', 'Revised mission-critical press metadata'), updatePressRelease);
router.patch('/:id', checkPermission('media_write'), logActivity('update_press', 'press', 'Patched official communique tactical payload'), updatePressRelease);

// @route   DELETE /api/press/:id
// @desc    Delete press release
// @access  Private (Media Team)
router.delete('/:id', checkPermission('media_delete'), logActivity('delete_press', 'press', 'Declassified and purged press communique'), deletePressRelease);

// @route   PUT /api/press/:id/publish
// @desc    Publish press release
// @access  Private (Media Team)
router.put('/:id/publish', checkPermission('media_publish'), logActivity('update_content', 'content', 'Published press release'), publishPressRelease);

// @route   PUT /api/press/:id/schedule
// @desc    Schedule press release
// @access  Private (Media Team)
router.put('/:id/schedule', checkPermission('media_write'), logActivity('update_content', 'content', 'Scheduled press release'), schedulePressRelease);

// @route   POST /api/press/:id/coverage
// @desc    Add media coverage
// @access  Private (Media Team)
router.post('/:id/coverage', checkPermission('media_write'), logActivity('update_content', 'content', 'Added media coverage'), addMediaCoverage);

module.exports = router;