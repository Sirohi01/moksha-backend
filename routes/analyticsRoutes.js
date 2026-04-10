const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, checkPermission } = require('../middleware/auth');

// Public tracking route (no auth required)
router.post('/track', analyticsController.trackActivity);

// Protected admin routes
router.get('/visitors', protect, checkPermission('page_analytics'), analyticsController.getVisitorStats);
router.get('/visitors/:ip', protect, checkPermission('page_analytics'), analyticsController.getVisitorDetailsByIP);

module.exports = router;