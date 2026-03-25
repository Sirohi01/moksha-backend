const express = require('express');
const {
  subscribe,
  getSubscribers,
  unsubscribe
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/subscribe', subscribe);
router.put('/unsubscribe', unsubscribe);

// Protected admin routes
router.get('/subscribers', protect, authorize('super_admin', 'admin', 'manager'), getSubscribers);

module.exports = router;
