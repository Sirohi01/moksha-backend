const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getSOPs,
  getSOP,
  createSOP,
  updateSOP,
  deleteSOP
} = require('../controllers/sopController');
const { logActivity } = require('../middleware/activityLogger');
router.get('/', optionalAuth, getSOPs);
router.get('/:id', optionalAuth, getSOP);
router.post('/', protect, authorize('super_admin', 'admin', 'manager'), logActivity('create_sop', 'sop', 'Created a new SOP manual'), createSOP);
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager'), logActivity('update_sop', 'sop', 'Updated an SOP manual'), updateSOP);
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager'), logActivity('delete_sop', 'sop', 'Deleted an SOP manual'), deleteSOP);

module.exports = router;
