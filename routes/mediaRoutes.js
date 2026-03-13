const express = require('express');
const multer = require('multer');
const {
  getMediaAssets,
  getMediaAsset,
  uploadMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  bulkUploadAssets,
  updateApprovalStatus,
  getMediaAnalytics
} = require('../controllers/mediaController');

const { protect, authorize, checkPermission } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images, videos, documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('application/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// All routes require authentication
router.use(protect);

// Analytics route (accessible to all media team)
router.get('/analytics', checkPermission('media_read'), getMediaAnalytics);

// CRUD routes
router.route('/')
  .get(checkPermission('media_read'), getMediaAssets)
  .post(checkPermission('media_write'), upload.single('file'), uploadMediaAsset);

// Bulk upload
router.post('/bulk', 
  checkPermission('media_write'), 
  upload.array('files', 20), 
  bulkUploadAssets
);

// Individual asset routes
router.route('/:id')
  .get(checkPermission('media_read'), getMediaAsset)
  .put(checkPermission('media_write'), updateMediaAsset)
  .delete(checkPermission('media_delete'), deleteMediaAsset);

// Approval workflow (Manager only)
router.put('/:id/approval', 
  checkPermission('media_approve'), 
  updateApprovalStatus
);

module.exports = router;