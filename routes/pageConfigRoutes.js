const express = require('express');
const {
  getPageConfig,
  updatePageConfig,
  getAllPageConfigs,
  deletePageConfig,
  getPageConfigHistory,
  restorePageConfigVersion,
  getPageConfigSchema,
  updatePageSEO
} = require('../controllers/pageConfigController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route to get page configuration
router.get('/:pageName', getPageConfig);
router.get('/:pageName/schema', getPageConfigSchema);

// Protected routes for admin management
router.use(protect);
router.use(authorize('super_admin', 'admin', 'manager', 'seo_team', 'content_team'));

// Admin routes
router.get('/', getAllPageConfigs);
router.put('/:pageName', updatePageConfig);
router.put('/:pageName/seo', updatePageSEO);
router.delete('/:pageName', deletePageConfig);
router.get('/:pageName/history', getPageConfigHistory);
router.post('/:pageName/restore/:version', restorePageConfigVersion);

module.exports = router;