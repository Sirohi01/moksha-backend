const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const {
  getGalleryImages,
  uploadImage,
  updateImage,
  deleteImage,
  getGalleryStats
} = require('../controllers/galleryController');

// Multer Configuration (Memory storage for direct Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024, // 1MB limit for images
  },
  fileFilter: (req, file, cb) => {
    // Check if it's an image by mimetype OR extension
    const isImageMime = file.mimetype.startsWith('image/');
    const isImageExt = /\.(jpg|jpeg|png|gif|webp|avif|tiff|bmp)$/i.test(file.originalname);

    if (isImageMime || isImageExt) {
      return cb(null, true);
    } else {
      cb(new Error(`File type rejected: ${file.mimetype}. Only image files are allowed (JPG, PNG, WEBP, etc.).`));
    }
  }
});

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', getGalleryImages);

// @route   GET /api/gallery/stats
// @desc    Get gallery statistics
// @access  Private
router.get('/stats', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), getGalleryStats);

// @route   POST /api/gallery
// @desc    Upload new image
// @access  Private
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), upload.single('image'), uploadImage);

// @route   PUT /api/gallery/:id
// @desc    Update image details
// @access  Private
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), updateImage);

// @route   DELETE /api/gallery/:id
// @desc    Delete image
// @access  Private
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), deleteImage);

module.exports = router;