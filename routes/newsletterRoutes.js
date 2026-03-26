const express = require('express');
const {
  subscribe,
  getSubscribers,
  unsubscribe,
  broadcastNewsletter
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.post('/subscribe', subscribe);
router.put('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, authorize('super_admin', 'admin', 'manager'), getSubscribers);
router.post('/broadcast', protect, authorize('super_admin', 'admin', 'manager'), broadcastNewsletter);

module.exports = router;
