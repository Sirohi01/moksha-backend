const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
  getAllContacts, 
  sendWhatsAppToContacts, 
  getWhatsAppLogs,
  getContactHistory
} = require('../controllers/adminContactController');

// All routes require authentication and admin/manager role
router.use(protect);
router.use(authorize('super_admin', 'admin', 'manager'));

// @route   GET /api/admin/contacts
// @desc    Get all unique contacts across the system
router.get('/', getAllContacts);

// @route   POST /api/admin/contacts/whatsapp
// @desc    Send WhatsApp message to specific contacts
router.post('/whatsapp', sendWhatsAppToContacts);

// @route   GET /api/admin/contacts/whatsapp/history/:phone
// @desc    Get conversation history
router.get('/whatsapp/history/:phone', getContactHistory);

// @route   GET /api/admin/contacts/whatsapp/logs
// @desc    Get WhatsApp communication logs
router.get('/whatsapp/logs', getWhatsAppLogs);

module.exports = router;
