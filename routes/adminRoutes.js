const express = require('express');
const {
  getDashboardStats,
  getRecentActivities,
  getSystemHealth,
  getEmailLogs
} = require('../controllers/adminController');
const { runMaintenanceScript, getScriptsStatus, runCustomCommand } = require('../controllers/maintenanceController');

const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.get('/dashboard', checkPermission('view_analytics'), getDashboardStats);
router.get('/recent-activities', checkPermission('view_analytics'), getRecentActivities);
router.get('/system-health', checkPermission('manage_system'), getSystemHealth);
router.get('/email-logs', checkPermission('view_analytics'), getEmailLogs);
router.get('/maintenance/scripts', checkPermission('manage_system'), getScriptsStatus);
router.post('/maintenance/run-script', checkPermission('manage_system'), runMaintenanceScript);
router.post('/maintenance/run-custom', checkPermission('manage_system'), runCustomCommand);



module.exports = router;