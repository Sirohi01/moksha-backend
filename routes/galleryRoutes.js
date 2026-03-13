const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getGalleryImages,
  uploadImage,
  updateImage,
  deleteImage,
  getGalleryStats
} = require('../controllers/galleryController');

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Private
router.get('/', protect, getGalleryImages);

// @route   GET /api/gallery/stats
// @desc    Get gallery statistics
// @access  Private
router.get('/stats', protect, authorize(['super_admin', 'manager', 'media_team']), getGalleryStats);

// @route   POST /api/gallery
// @desc    Upload new image
// @access  Private
router.post('/', protect, authorize(['super_admin', 'manager', 'media_team']), uploadImage);

// @route   PUT /api/gallery/:id
// @desc    Update image details
// @access  Private
router.put('/:id', protect, authorize(['super_admin', 'manager', 'media_team']), updateImage);

// @route   DELETE /api/gallery/:id
// @desc    Delete image
// @access  Private
router.delete('/:id', protect, authorize(['super_admin', 'manager', 'media_team']), deleteImage);

module.exports = router;