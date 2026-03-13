const PressRelease = require('../models/PressRelease');
const MediaAsset = require('../models/MediaAsset');
const asyncHandler = require('express-async-handler');

// @desc    Get all press releases
// @route   GET /api/press
// @access  Private (Media Team)
const getPressReleases = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.author) filter.author = req.query.author;
  
  // Search functionality
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } },
      { tags: { $in: [new RegExp(req.query.search, 'i')] } }
    ];
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  const pressReleases = await PressRelease.find(filter)
    .populate('author', 'name email')
    .populate('featuredImage', 'url title altText')
    .populate('mediaAssets', 'url title type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await PressRelease.countDocuments(filter);

  res.json({
    success: true,
    data: pressReleases,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single press release
// @route   GET /api/press/:id
// @access  Private (Media Team)
const getPressRelease = asyncHandler(async (req, res) => {
  const pressRelease = await PressRelease.findById(req.params.id)
    .populate('author', 'name email')
    .populate('featuredImage')
    .populate('mediaAssets')
    .populate('approvedBy', 'name')
    .populate('lastModifiedBy', 'name');

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  // Increment views
  await pressRelease.incrementViews();

  res.json({
    success: true,
    data: pressRelease
  });
});

// @desc    Create press release
// @route   POST /api/press
// @access  Private (Media Team)
const createPressRelease = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    content,
    excerpt,
    category,
    tags,
    featuredImage,
    mediaAssets,
    metaTitle,
    metaDescription,
    keywords,
    contactPerson,
    scheduledFor,
    status
  } = req.body;

  const pressRelease = await PressRelease.create({
    title,
    subtitle,
    content,
    excerpt,
    category,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    featuredImage,
    mediaAssets: mediaAssets || [],
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || excerpt,
    keywords: keywords ? keywords.split(',').map(keyword => keyword.trim()) : [],
    contactPerson,
    scheduledFor,
    status: status || 'draft',
    author: req.admin._id,
    publishedAt: status === 'published' ? new Date() : undefined
  });

  await pressRelease.populate([
    { path: 'author', select: 'name email' },
    { path: 'featuredImage', select: 'url title altText' },
    { path: 'mediaAssets', select: 'url title type' }
  ]);

  res.status(201).json({
    success: true,
    data: pressRelease,
    message: 'Press release created successfully'
  });
});

// @desc    Update press release
// @route   PUT /api/press/:id
// @access  Private (Media Team)
const updatePressRelease = asyncHandler(async (req, res) => {
  const pressRelease = await PressRelease.findById(req.params.id);

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  const {
    title,
    subtitle,
    content,
    excerpt,
    category,
    tags,
    featuredImage,
    mediaAssets,
    metaTitle,
    metaDescription,
    keywords,
    contactPerson,
    scheduledFor,
    status
  } = req.body;

  // Save revision history
  if (pressRelease.content !== content || pressRelease.title !== title) {
    pressRelease.revisionHistory.push({
      version: pressRelease.version,
      changes: 'Content or title updated',
      modifiedBy: req.admin._id,
      modifiedAt: new Date()
    });
    pressRelease.version += 1;
  }

  // Update fields
  if (title) pressRelease.title = title;
  if (subtitle) pressRelease.subtitle = subtitle;
  if (content) pressRelease.content = content;
  if (excerpt) pressRelease.excerpt = excerpt;
  if (category) pressRelease.category = category;
  if (tags) pressRelease.tags = tags.split(',').map(tag => tag.trim());
  if (featuredImage) pressRelease.featuredImage = featuredImage;
  if (mediaAssets) pressRelease.mediaAssets = mediaAssets;
  if (metaTitle) pressRelease.metaTitle = metaTitle;
  if (metaDescription) pressRelease.metaDescription = metaDescription;
  if (keywords) pressRelease.keywords = keywords.split(',').map(keyword => keyword.trim());
  if (contactPerson) pressRelease.contactPerson = contactPerson;
  if (scheduledFor) pressRelease.scheduledFor = scheduledFor;
  
  if (status) {
    pressRelease.status = status;
    if (status === 'published' && !pressRelease.publishedAt) {
      pressRelease.publishedAt = new Date();
    }
  }

  pressRelease.lastModifiedBy = req.admin._id;

  await pressRelease.save();
  await pressRelease.populate([
    { path: 'author', select: 'name email' },
    { path: 'featuredImage', select: 'url title altText' },
    { path: 'mediaAssets', select: 'url title type' }
  ]);

  res.json({
    success: true,
    data: pressRelease,
    message: 'Press release updated successfully'
  });
});

// @desc    Delete press release
// @route   DELETE /api/press/:id
// @access  Private (Media Team)
const deletePressRelease = asyncHandler(async (req, res) => {
  const pressRelease = await PressRelease.findById(req.params.id);

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  await pressRelease.deleteOne();

  res.json({
    success: true,
    message: 'Press release deleted successfully'
  });
});

// @desc    Publish press release
// @route   PUT /api/press/:id/publish
// @access  Private (Media Team)
const publishPressRelease = asyncHandler(async (req, res) => {
  const pressRelease = await PressRelease.findById(req.params.id);

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  pressRelease.status = 'published';
  pressRelease.publishedAt = new Date();
  
  await pressRelease.save();

  res.json({
    success: true,
    data: pressRelease,
    message: 'Press release published successfully'
  });
});

// @desc    Schedule press release
// @route   PUT /api/press/:id/schedule
// @access  Private (Media Team)
const schedulePressRelease = asyncHandler(async (req, res) => {
  const { scheduledFor } = req.body;
  
  const pressRelease = await PressRelease.findById(req.params.id);

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  pressRelease.status = 'scheduled';
  pressRelease.scheduledFor = new Date(scheduledFor);
  
  await pressRelease.save();

  res.json({
    success: true,
    data: pressRelease,
    message: 'Press release scheduled successfully'
  });
});

// @desc    Add media coverage
// @route   POST /api/press/:id/coverage
// @access  Private (Media Team)
const addMediaCoverage = asyncHandler(async (req, res) => {
  const { outlet, url, publishedAt, reach, sentiment } = req.body;
  
  const pressRelease = await PressRelease.findById(req.params.id);

  if (!pressRelease) {
    return res.status(404).json({
      success: false,
      message: 'Press release not found'
    });
  }

  pressRelease.coverage.push({
    outlet,
    url,
    publishedAt: new Date(publishedAt),
    reach: parseInt(reach) || 0,
    sentiment
  });

  await pressRelease.save();

  res.json({
    success: true,
    data: pressRelease,
    message: 'Media coverage added successfully'
  });
});

// @desc    Get press analytics
// @route   GET /api/press/analytics
// @access  Private (Media Team)
const getPressAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;
  
  // Calculate date range
  const days = parseInt(timeRange.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await PressRelease.aggregate([
    {
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              totalReleases: { $sum: 1 },
              totalViews: { $sum: '$views' },
              totalDownloads: { $sum: '$downloads' },
              totalShares: { $sum: '$shares' },
              totalCoverage: { $sum: { $size: '$coverage' } }
            }
          }
        ],
        statusBreakdown: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        categoryBreakdown: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              views: { $sum: '$views' }
            }
          }
        ],
        recentActivity: [
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
            $sort: { views: -1 }
          },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              views: 1,
              downloads: 1,
              shares: 1,
              publishedAt: 1
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
  getPressReleases,
  getPressRelease,
  createPressRelease,
  updatePressRelease,
  deletePressRelease,
  publishPressRelease,
  schedulePressRelease,
  addMediaCoverage,
  getPressAnalytics
};