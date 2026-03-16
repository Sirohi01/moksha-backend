const express = require('express');
const {
  getSEOData,
  getSEOPage,
  createSEOPage,
  updateSEOPage,
  deleteSEOPage,
  runSEOAudit,
  getSEOStats,
  generateSitemap,
  analyzeKeywords,
  getSEOReport,
  bulkUpdateMetaTags
} = require('../controllers/seoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All SEO routes require authentication and SEO team permission
router.use(protect);
router.use(authorize('super_admin', 'admin', 'manager', 'seo_team'));

// SEO Pages Management
router.get('/', getSEOData);
router.post('/', createSEOPage);
router.get('/stats', getSEOStats);
router.get('/report', getSEOReport);
router.get('/:id', getSEOPage);
router.put('/:id', updateSEOPage);
router.delete('/:id', deleteSEOPage);

// SEO Tools
router.post('/:id/audit', runSEOAudit);
router.post('/sitemap', generateSitemap);
router.post('/keywords/analyze', analyzeKeywords);
router.put('/bulk/meta-tags', bulkUpdateMetaTags);

module.exports = router;