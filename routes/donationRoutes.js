const express = require('express');
const { createDonation, getDonations, getDonation, updatePaymentStatus } = require('../controllers/donationController');
const { donationValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', donationValidation, createDonation);
router.put('/:id/payment', updatePaymentStatus);

// Admin routes (protected)
router.get('/', protect, getDonations);
router.get('/:id', protect, getDonation);

module.exports = router;