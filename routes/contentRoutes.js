const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentStats,
  getPublicSlugs
} = require('../controllers/contentController');

// Public route for sitemap
router.get('/public/slugs', getPublicSlugs);


// @route   GET /api/content
// @desc    Get all content items
// @access  Public (Enforces published status if no token)
router.get('/', optionalAuth, getContentItems);

// @route   GET /api/content/stats
// @desc    Get content statistics
// @access  Private
router.get('/stats', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), getContentStats);

// @route   GET /api/content/:id
// @desc    Get single content item
// @access  Public (Enforces published status if no token)
router.get('/:id', getContentItem);

// @route   POST /api/content
// @desc    Create new content item
// @access  Private
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), createContentItem);

// @route   PUT /api/content/:id
// @desc    Update content item
// @access  Private
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), updateContentItem);
router.patch('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), updateContentItem);

// @route   DELETE /api/content/:id
// @desc    Delete content item
// @access  Private
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), deleteContentItem);

module.exports = router;