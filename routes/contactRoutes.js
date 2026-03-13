const express = require('express');
const { createContact, getContacts, getContact, updateContact } = require('../controllers/contactController');
const { contactValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', contactValidation, createContact);

// Admin routes (protected)
router.get('/', protect, getContacts);
router.get('/:id', protect, getContact);
router.put('/:id', protect, updateContact);

module.exports = router;