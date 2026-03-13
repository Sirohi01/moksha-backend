const express = require('express');
const { createBoardApplication, getBoardApplications, getBoardApplication, updateBoardApplication } = require('../controllers/boardController');
const { boardValidation } = require('../middleware/validation');
const { upload } = require('../services/cloudinaryService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Multer fields for file uploads
const uploadFields = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 }
]);

// Public routes
router.post('/', uploadFields, boardValidation, createBoardApplication);

// Admin routes (protected)
router.get('/', protect, getBoardApplications);
router.get('/:id', protect, getBoardApplication);
router.put('/:id', protect, updateBoardApplication);

module.exports = router;