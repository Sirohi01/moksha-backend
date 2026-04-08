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
  getGalleryStats,
  getCategories
} = require('../controllers/galleryController');
const { logActivity } = require('../middleware/activityLogger');

// Multer Configuration (Memory storage for direct Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for images and documents
  },
  fileFilter: (req, file, cb) => {
    // Check if it's an image or PDF
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';
    const isAllowedExt = /\.(jpg|jpeg|png|gif|webp|pdf)$/i.test(file.originalname);

    if (isImage || isPDF || isAllowedExt) {
      return cb(null, true);
    } else {
      cb(new Error(`File type rejected: ${file.mimetype}. Only images and PDFs are allowed.`));
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

// @route   GET /api/gallery/categories
// @desc    Get gallery categories
// @access  Public
router.get('/categories', getCategories);

// @route   POST /api/gallery
// @desc    Upload new image
// @access  Private
router.post('/', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), upload.single('image'), logActivity('upload_media', 'gallery', 'Uploaded new image'), uploadImage);

// @route   PUT /api/gallery/:id
// @desc    Update image details
// @access  Private
router.put('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), logActivity('update_content', 'gallery', 'Updated image details'), updateImage);

// @route   DELETE /api/gallery/:id
// @desc    Delete image
// @access  Private
router.delete('/:id', protect, authorize('super_admin', 'admin', 'manager', 'media_team', 'content_team', 'seo_team'), logActivity('delete_media', 'gallery', 'Deleted image'), deleteImage);

module.exports = router;