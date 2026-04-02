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
const { logActivity } = require('../middleware/activityLogger');
router.get('/public/slugs', getPublicSlugs);
router.get('/', optionalAuth, getContentItems);
router.get('/stats', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), getContentStats);
router.get('/:id', getContentItem);
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('update_content', 'content', 'Created new content item'), createContentItem);
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('update_content', 'content', 'Updated content item'), updateContentItem);
router.patch('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('update_content', 'content', 'Patched content item'), updateContentItem);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'), logActivity('delete_content', 'content', 'Deleted content item'), deleteContentItem);

module.exports = router;