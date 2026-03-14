const express = require('express');
const { 
  createDonation, 
  getDonations, 
  getDonation, 
  updatePaymentStatus,
  emailReceipt,
  refundDonation,
  getDonationByReceipt
} = require('../controllers/donationController');
const { donationValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', donationValidation, createDonation);
router.put('/:id/payment', updatePaymentStatus);
router.get('/receipt/:receiptNumber', getDonationByReceipt);

// Admin routes (protected)
router.get('/', protect, getDonations);
router.get('/:id', protect, getDonation);
router.post('/:id/email-receipt', protect, emailReceipt);
router.post('/:id/refund', protect, refundDonation);

module.exports = router;