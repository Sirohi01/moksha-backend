const express = require('express');
const router = express.Router();
const { 
  getCampaigns, 
  createCampaign, 
  getMarketingContent, 
  updateMarketingContent, 
  toggleContentStatus, 
  getSegments, 
  createSegment,
  createMarketingContent,
  deleteMarketingContent
} = require('../controllers/marketingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('super_admin', 'manager', 'media_team', 'seo_team'));

// Campaigns (UTM)
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);

// Content (Banners/Pop-ups)
router.get('/content', getMarketingContent);
router.post('/content', createMarketingContent);
router.put('/content/:id', updateMarketingContent);
router.patch('/content/:id/toggle', toggleContentStatus);
router.delete('/content/:id', deleteMarketingContent);

// Segmentation
router.get('/segments', getSegments);
router.post('/segments', createSegment);

module.exports = router;
