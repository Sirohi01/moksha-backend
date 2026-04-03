const express = require('express');
const {
  getSEOData,
  getSEOPage,
  getSEOPageByName,
  createSEOPage,
  updateSEOPage,
  updateSEOPageByName,
  deleteSEOPage,
  runSEOAudit,
  getSEOStats,
  generateSitemap,
  analyzeKeywords,
  getSEOReport,
  bulkUpdateMetaTags,
  getGlobalSEO,
  updateGlobalSEO,
  getGlobalRedirects
} = require('../controllers/seoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.get('/public/redirects', getGlobalRedirects);
router.get('/page/:pageName', getSEOPageByName);
router.get('/settings', getGlobalSEO);
router.use(protect);
router.use(authorize('super_admin', 'admin', 'manager', 'seo_team'));
router.put('/settings', updateGlobalSEO);
router.get('/', getSEOData);
router.post('/', createSEOPage);
router.get('/stats', getSEOStats);
router.get('/report', getSEOReport);
router.get('/:id', getSEOPage);
router.put('/page/:pageName', updateSEOPageByName);
router.put('/:id', updateSEOPage);
router.delete('/:id', deleteSEOPage);
router.post('/:id/audit', runSEOAudit);
router.post('/sitemap', generateSitemap);
router.post('/keywords/analyze', analyzeKeywords);
router.put('/bulk/meta-tags', bulkUpdateMetaTags);

module.exports = router;