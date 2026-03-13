const express = require('express');
const { getDashboardStats, getRecentActivities, getSystemHealth } = require('../controllers/adminController');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// Dashboard and statistics routes
router.get('/dashboard', checkPermission('view_analytics'), getDashboardStats);
router.get('/recent-activities', checkPermission('view_analytics'), getRecentActivities);
router.get('/system-health', checkPermission('manage_system'), getSystemHealth);

module.exports = router;