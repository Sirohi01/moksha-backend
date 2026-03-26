const express = require('express');
const router = express.Router();
const { 
  getErrorLogs, 
  getCommunicationLogs, 
  getPerformanceSummary,
  recordInteraction,
  getInteractionAnalytics
} = require('../controllers/intelligenceController');
const { protect, authorize } = require('../middleware/auth');

// Public route for tracking clicks
router.post('/track-interaction', recordInteraction);

// Intelligence routes are restricted to super_admin or manager
router.use(protect);
router.use(authorize('super_admin', 'manager'));

router.get('/error-logs', getErrorLogs);
router.get('/communication-logs', getCommunicationLogs);
router.get('/performance-summary', getPerformanceSummary);
router.get('/interaction-stats', getInteractionAnalytics);

module.exports = router;
