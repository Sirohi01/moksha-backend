const express = require('express');
const { createLegacyRequest, getLegacyRequests, getLegacyRequest, updateLegacyRequest } = require('../controllers/legacyController');
const { legacyValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', legacyValidation, createLegacyRequest);

// Admin routes (protected)
router.get('/', protect, getLegacyRequests);
router.get('/:id', protect, getLegacyRequest);
router.put('/:id', protect, updateLegacyRequest);

module.exports = router;