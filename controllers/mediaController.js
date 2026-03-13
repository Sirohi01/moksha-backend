const MediaAsset = require('../models/MediaAsset');
const cloudinary = require('../services/cloudinaryService');
const asyncHandler = require('express-async-handler');

// @desc    Get all media assets
// @route   GET /api/media
// @access  Private (Media Team)
const getMediaAssets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.uploadedBy) filter.uploadedBy = req.query.uploadedBy;
  
  // Search functionality
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const assets = await MediaAsset.find(filter)
    .populate('uploadedBy', 'name email')
    .populate('parentAsset', 'title version')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MediaAsset.countDocuments(filter);

  res.json({
    success: true,
    data: assets,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single media asset
// @route   GET /api/media/:id
// @access  Private (Media Team)
const getMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .populate('parentAsset', 'title version')
    .populate('approvalHistory.by', 'name');

  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Media asset not found'
    });
  }

  // Increment view count
  await asset.incrementView();

  res.json({
    success: true,
    data: asset
  });
});

// @desc    Upload media asset
// @route   POST /api/media
// @access  Private (Media Team)
const uploadMediaAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const {
    title,
    description,
    type,
    category,
    altText,
    caption,
    tags,
    keywords,
    isPublic,
    isFeatured
  } = req.body;

  // Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    folder: `moksha-seva/media/${category}`,
    resource_type: 'auto',
    transformation: type === 'image' ? [
      { quality: 'auto:good' },
      { fetch_format: 'auto' }
    ] : undefined
  });

  // Get file dimensions for images/videos
  let dimensions = {};
  if (uploadResult.width && uploadResult.height) {
    dimensions = {
      width: uploadResult.width,
      height: uploadResult.height
    };
  }

  const mediaAsset = await MediaAsset.create({
    title,
    description,
    type,
    category,
    filename: uploadResult.public_id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: uploadResult.bytes,
    dimensions,
    duration: uploadResult.duration,
    url: uploadResult.secure_url,
    thumbnailUrl: uploadResult.eager?.[0]?.secure_url || uploadResult.secure_url,
    cloudinaryId: uploadResult.public_id,
    altText,
    caption,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
    uploadedBy: req.admin._id,
    isPublic: isPublic === 'true',
    isFeatured: isFeatured === 'true'
  });

  await mediaAsset.populate('uploadedBy', 'name email');

  res.status(201).json({
    success: true,
    data: mediaAsset,
    message: 'Media asset uploaded successfully'
  });
});

// @desc    Update media asset
// @route   PUT /api/media/:id
// @access  Private (Media Team)
const updateMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id);

  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Media asset not found'
    });
  }

  const {
    title,
    description,
    altText,
    caption,
    tags,
    keywords,
    isPublic,
    isFeatured,
    category
  } = req.body;

  // Update fields
  if (title) asset.title = title;
  if (description) asset.description = description;
  if (altText) asset.altText = altText;
  if (caption) asset.caption = caption;
  if (category) asset.category = category;
  if (tags) asset.tags = tags.split(',').map(tag => tag.trim());
  if (keywords) asset.keywords = keywords.split(',').map(keyword => keyword.trim());
  if (isPublic !== undefined) asset.isPublic = isPublic === 'true';
  if (isFeatured !== undefined) asset.isFeatured = isFeatured === 'true';

  await asset.save();
  await asset.populate('uploadedBy', 'name email');

  res.json({
    success: true,
    data: asset,
    message: 'Media asset updated successfully'
  });
});

// @desc    Delete media asset
// @route   DELETE /api/media/:id
// @access  Private (Media Team)
const deleteMediaAsset = asyncHandler(async (req, res) => {
  const asset = await MediaAsset.findById(req.params.id);

  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Media asset not found'
    });
  }

  // Delete from Cloudinary
  if (asset.cloudinaryId) {
    await cloudinary.uploader.destroy(asset.cloudinaryId);
  }

  await asset.deleteOne();

  res.json({
    success: true,
    message: 'Media asset deleted successfully'
  });
});

// @desc    Bulk upload media assets
// @route   POST /api/media/bulk
// @access  Private (Media Team)
const bulkUploadAssets = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  const { category, isPublic, tags } = req.body;
  const uploadedAssets = [];
  const errors = [];

  for (const file of req.files) {
    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: `moksha-seva/media/${category || 'other'}`,
        resource_type: 'auto'
      });

      const mediaAsset = await MediaAsset.create({
        title: file.originalname.split('.')[0],
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('video/') ? 'video' : 'document',
        category: category || 'other',
        filename: uploadResult.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: uploadResult.bytes,
        url: uploadResult.secure_url,
        cloudinaryId: uploadResult.public_id,
        uploadedBy: req.admin._id,
        isPublic: isPublic === 'true',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      });

      uploadedAssets.push(mediaAsset);
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  res.json({
    success: true,
    data: {
      uploaded: uploadedAssets,
      errors
    },
    message: `${uploadedAssets.length} files uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`
  });
});

// @desc    Update asset approval status
// @route   PUT /api/media/:id/approval
// @access  Private (Manager)
const updateApprovalStatus = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  
  const asset = await MediaAsset.findById(req.params.id);
  
  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Media asset not found'
    });
  }

  asset.status = status;
  asset.approvalHistory.push({
    action: status === 'approved' ? 'approved' : 'rejected',
    by: req.admin._id,
    comment,
    timestamp: new Date()
  });

  await asset.save();
  await asset.populate('approvalHistory.by', 'name');

  res.json({
    success: true,
    data: asset,
    message: `Asset ${status} successfully`
  });
});

// @desc    Get media analytics
// @route   GET /api/media/analytics
// @access  Private (Media Team)
const getMediaAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  // Calculate date range
  const days = parseInt(timeRange.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Aggregate analytics
  const analytics = await MediaAsset.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalAssets: { $sum: 1 },
              totalViews: { $sum: '$viewCount' },
              totalDownloads: { $sum: '$downloadCount' },
              totalSize: { $sum: '$fileSize' }
            }
          }
        ],
        typeBreakdown: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              views: { $sum: '$viewCount' },
              downloads: { $sum: '$downloadCount' }
            }
          }
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              views: { $sum: '$viewCount' }
            }
          }
        ],
        recentUploads: [
          {
            $match: {
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        topPerforming: [
          {
            $sort: { viewCount: -1 }
          },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              type: 1,
              viewCount: 1,
              downloadCount: 1,
              url: 1
            }
          }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: analytics[0]
  });
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