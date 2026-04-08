const express = require('express');
const router = express.Router();
const {
  createLiveStream,
  getActiveStream,
  getAllStreams,
  updateStatus,
  getStreamMessages,
  deleteLiveStream,
  deleteStreamMessage
} = require('../controllers/liveController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/active', getActiveStream);
router.get('/:id/messages', getStreamMessages);

// Private/Admin routes
router.get('/all', protect, authorize('super_admin', 'admin', 'manager'), getAllStreams);
router.post('/create', protect, authorize('super_admin', 'admin', 'manager'), createLiveStream);
router.patch('/:id/status', protect, authorize('super_admin', 'admin', 'manager'), updateStatus);

router.delete('/message/:messageId', protect, authorize('super_admin', 'admin', 'manager'), deleteStreamMessage);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager'), deleteLiveStream);

module.exports = router;
