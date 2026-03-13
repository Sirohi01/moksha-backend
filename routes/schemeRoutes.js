const express = require('express');
const { createSchemeApplication, getSchemeApplications, getSchemeApplication, updateSchemeStatus } = require('../controllers/schemeController');
const { schemeValidation } = require('../middleware/validation');
const { upload } = require('../services/cloudinaryService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multiple file upload for documents
const uploadDocuments = upload.array('documents', 10);

// Public routes
router.post('/', uploadDocuments, schemeValidation, createSchemeApplication);

// Admin routes (protected)
router.get('/', protect, getSchemeApplications);
router.get('/:id', protect, getSchemeApplication);
router.put('/:id', protect, updateSchemeStatus);

module.exports = router;