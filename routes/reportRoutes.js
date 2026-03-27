const express = require('express');
const { createReport, getReports, getReport, updateReport, getPublicStats, getPublicReports } = require('../controllers/reportController');
const { reportValidation } = require('../middleware/validation');
const { upload } = require('../services/cloudinaryService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer fields for file uploads
const uploadFields = upload.fields([
  { name: 'bplCardPhoto', maxCount: 1 },
  { name: 'aadhaarPhoto', maxCount: 1 },
  { name: 'nocPhoto', maxCount: 1 },
  { name: 'panPhoto', maxCount: 1 }
]);

// Public routes
router.post('/', uploadFields, reportValidation, createReport);
router.get('/public/stats', getPublicStats);
router.get('/public/list', getPublicReports);

// Admin routes (protected)
router.get('/', protect, getReports);
router.get('/:id', protect, getReport);
router.put('/:id', protect, updateReport);

module.exports = router;