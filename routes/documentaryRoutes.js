const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDocumentaries,
  getDocumentary,
  createDocumentary,
  updateDocumentary,
  deleteDocumentary,
  getDocumentaryStats,
  getPublicSlugs
} = require('../controllers/documentaryController');
const { logActivity } = require('../middleware/activityLogger');

// @route   GET /api/documentaries
// @desc    Get all documentaries
// @access  Private
router.get('/', protect, getDocumentaries);

// @route   GET /api/documentaries/stats
// @desc    Get documentary statistics
// @access  Private
router.get('/stats', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team'), getDocumentaryStats);

// @route   GET /api/documentaries/:id
// @desc    Get single documentary
// @access  Private
router.get('/:id', protect, getDocumentary);

// @route   POST /api/documentaries
// @desc    Create new documentary item
// @access  Private
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('create_documentary', 'documentary', 'Created new documentary mission profile'), createDocumentary);

// @route   PUT /api/documentaries/:id
// @desc    Update documentary item
// @access  Private
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('update_documentary', 'documentary', 'Updated documentary registry metadata'), updateDocumentary);
router.patch('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('update_documentary', 'documentary', 'Patched documentary tactical payload'), updateDocumentary);

// @route   DELETE /api/documentaries/:id
// @desc    Delete documentary item
// @access  Private
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('delete_documentary', 'documentary', 'Purged documentary mission from registries'), deleteDocumentary);

module.exports = router;