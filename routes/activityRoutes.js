const express = require('express');
const { getActivities, getActivityById } = require('../controllers/activityController');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

// All activity routes require authentication
router.use(protect);

// Activity routes
router.get('/', checkPermission('view_analytics'), getActivities);
router.get('/:id', checkPermission('view_analytics'), getActivityById);

module.exports = router;