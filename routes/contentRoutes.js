const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentStats
} = require('../controllers/contentController');

// @route   GET /api/content
// @desc    Get all content items
// @access  Private
router.get('/', protect, getContentItems);

// @route   GET /api/content/stats
// @desc    Get content statistics
// @access  Private
router.get('/stats', protect, authorize(['super_admin', 'manager', 'seo_team']), getContentStats);

// @route   GET /api/content/:id
// @desc    Get single content item
// @access  Private
router.get('/:id', protect, getContentItem);

// @route   POST /api/content
// @desc    Create new content item
// @access  Private
router.post('/', protect, authorize(['super_admin', 'manager', 'seo_team']), createContentItem);

// @route   PUT /api/content/:id
// @desc    Update content item
// @access  Private
router.put('/:id', protect, authorize(['super_admin', 'manager', 'seo_team']), updateContentItem);

// @route   DELETE /api/content/:id
// @desc    Delete content item
// @access  Private
router.delete('/:id', protect, authorize(['super_admin', 'manager', 'seo_team']), deleteContentItem);

module.exports = router;