const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDocumentaries,
  getDocumentary,
  createDocumentary,
  updateDocumentary,
  deleteDocumentary,
  getDocumentaryStats
} = require('../controllers/documentaryController');

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
// @desc    Create new documentary
// @access  Private
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team'), createDocumentary);

// @route   PUT /api/documentaries/:id
// @desc    Update documentary
// @access  Private
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team'), updateDocumentary);

// @route   DELETE /api/documentaries/:id
// @desc    Delete documentary
// @access  Private
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team'), deleteDocumentary);

module.exports = router;