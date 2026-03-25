const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Public tracking route (no auth required)
router.post('/track', analyticsController.trackActivity);

// Protected admin routes
router.get('/visitors', protect, authorize('admin', 'superadmin'), analyticsController.getVisitorStats);
router.get('/visitors/:ip', protect, authorize('admin', 'superadmin'), analyticsController.getVisitorDetailsByIP);

module.exports = router;