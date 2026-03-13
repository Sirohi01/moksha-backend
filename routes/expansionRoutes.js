const express = require('express');
const { createExpansionRequest, getExpansionRequests, getExpansionRequest, updateExpansionRequest } = require('../controllers/expansionController');
const { expansionValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', expansionValidation, createExpansionRequest);

// Admin routes (protected)
router.get('/', protect, getExpansionRequests);
router.get('/:id', protect, getExpansionRequest);
router.put('/:id', protect, updateExpansionRequest);

module.exports = router;