const { uploadToCloudinary, deleteFromCloudinary, cloudinary } = require('../services/cloudinaryService');
const asyncHandler = require('express-async-handler');
const MediaAsset = require('../models/MediaAsset');

// @desc    Get all media assets
const getMediaAssets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const assets = await MediaAsset.find(filter)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MediaAsset.countDocuments(filter);

  res.json({
    success: true,
    data: assets,
    pagination: { total, pages: Math.ceil(total / limit), page, limit }
  });
});

// @desc    Upload media asset
const uploadMediaAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { title, description, type, category, altText, caption, tags, keywords, isPublic, isFeatured } = req.body;

  try {
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `moksha-seva/media/${category || 'other'}`,
      resource_type: 'auto'
    });

    const mediaAsset = await MediaAsset.create({
      title: title || req.file.originalname,
      description,
      type: type || 'document',
      category: category || 'other',
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: uploadResult.bytes,
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      altText,
      caption,
      uploadedBy: req.admin._id,
      isPublic: isPublic === 'true',
      isFeatured: isFeatured === 'true'
    });

    res.status(201).json({ success: true, data: mediaAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk Upload (Placeholder)
const bulkUploadAssets = asyncHandler(async (req, res) => {
    res.status(501).json({ success: false, message: 'Bulk upload not yet implemented in simplified controller' });
});

// Approval Status (Placeholder)
const updateApprovalStatus = asyncHandler(async (req, res) => {
    res.status(501).json({ success: false, message: 'Approval workflow not yet implemented' });
});

// Analytics (Placeholder)
const getMediaAnalytics = asyncHandler(async (req, res) => {
    res.status(501).json({ success: false, message: 'Analytics not yet implemented' });
});

// @desc    Get single media asset
const getMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id).populate('uploadedBy', 'name email');
  if (!asset) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: asset });
});

// @desc    Update media asset
const updateMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: asset });
});

// @desc    Delete media asset
const deleteMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id);
  if (asset && asset.cloudinaryId) await deleteFromCloudinary(asset.cloudinaryId);
  if (asset) await asset.deleteOne();
  res.json({ success: true, message: 'Deleted' });
});

module.exports = {
  getMediaAssets,
  getMediaAsset,
  uploadMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
  bulkUploadAssets,
  updateApprovalStatus,
  getMediaAnalytics
};