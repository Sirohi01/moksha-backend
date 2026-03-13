const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAnalytics,
  getAnalyticsOverview,
  getAnalyticsTrends,
  getAnalyticsDemographics,
  getPerformanceMetrics,
  getGeographicAnalytics,
  getTimeAnalytics,
  exportAnalytics,
  getRealtimeAnalytics
} = require('../controllers/analyticsController');

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private
router.get('/', protect, authorize(['super_admin', 'manager']), getAnalytics);

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', protect, getAnalyticsOverview);

// @route   GET /api/analytics/trends
// @desc    Get analytics trends
// @access  Private
router.get('/trends', protect, getAnalyticsTrends);

// @route   GET /api/analytics/demographics
// @desc    Get analytics demographics
// @access  Private
router.get('/demographics', protect, getAnalyticsDemographics);

// @route   GET /api/analytics/performance
// @desc    Get performance metrics
// @access  Private
router.get('/performance', protect, getPerformanceMetrics);

// @route   GET /api/analytics/geographic
// @desc    Get geographic analytics
// @access  Private
router.get('/geographic', protect, getGeographicAnalytics);

// @route   GET /api/analytics/time
// @desc    Get time-based analytics
// @access  Private
router.get('/time', protect, getTimeAnalytics);

// @route   POST /api/analytics/export
// @desc    Export analytics data
// @access  Private
router.post('/export', protect, authorize(['super_admin', 'manager']), exportAnalytics);

// @route   GET /api/analytics/realtime
// @desc    Get real-time analytics
// @access  Private
router.get('/realtime', protect, getRealtimeAnalytics);

module.exports = router;