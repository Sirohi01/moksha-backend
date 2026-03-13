const express = require('express');
const { createFeedback, getFeedback, getSingleFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { feedbackValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', feedbackValidation, createFeedback);

// Admin routes (protected)
router.get('/', protect, getFeedback);
router.get('/:id', protect, getSingleFeedback);
router.put('/:id/status', protect, updateFeedbackStatus);

module.exports = router;