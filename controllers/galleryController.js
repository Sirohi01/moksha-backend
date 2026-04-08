const { uploadToCloudinary, deleteFromCloudinary, cloudinary } = require('../services/cloudinaryService');
const MediaAsset = require('../models/MediaAsset');
const asyncHandler = require('express-async-handler');
const path = require('path');
const getGalleryImages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { category, search, isAdmin, isPublic } = req.query;
  const filter = {
    category: category && category !== 'all' ? category : 'gallery'
  };

  // If category is provided but it's one of the gallery categories, we use it
  if (category && category !== 'all') {
    filter.category = category;
  } else if (isAdmin === 'true') {
    // Admins see everything by default
    delete filter.category;
  } else {
    filter.category = { $in: ['gallery', 'events', 'services', 'community', 'volunteers', 'content_assets', 'general'] };
  }
  if (isAdmin === 'true' && isPublic !== undefined) {
    filter.isPublic = isPublic === 'true';
    if (filter.isPublic) {
      filter.status = 'approved';
      // If categories aren't explicitly requested, limit to standard gallery categories to match public view
      if (!category || category === 'all') {
        filter.category = { $in: ['gallery', 'events', 'services', 'community', 'volunteers'] };
      }
    }
  } else if (isAdmin !== 'true') {
    filter.status = 'approved';
    filter.isPublic = true;
    if (!category || category === 'all') {
      filter.category = { $in: ['gallery', 'events', 'services', 'community', 'volunteers'] };
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { altText: { $regex: search, $options: 'i' } }
    ];
  }

  const images = await MediaAsset.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MediaAsset.countDocuments(filter);

  // Transform for frontend compatibility (if needed)
  const formattedImages = images.map(img => ({
    id: img._id,
    src: img.url,
    alt: img.altText || img.title,
    title: img.title,
    description: img.description || '',
    category: img.category,
    uploadDate: img.createdAt,
    size: (img.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
    dimensions: img.dimensions ? `${img.dimensions.width}x${img.dimensions.height}` : 'N/A',
    cloudinaryId: img.cloudinaryId,
    status: img.status,
    isPublic: img.isPublic,
    tags: img.tags || []
  }));

  res.status(200).json({
    success: true,
    data: {
      images: formattedImages,
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  const { title, description, category, alt, altText, isPublic: isPublicBody } = req.body;
  const finalAltText = altText || alt;
  let isPublic = isPublicBody === 'true' || isPublicBody === true;
  if (isPublicBody === undefined) {
    isPublic = category === 'gallery' || !category;
  }
  const result = await uploadToCloudinary(req.file, `moksha-seva/gallery/${category || 'general'}`);

  const isImage = req.file.mimetype.startsWith('image/');

  const newAsset = await MediaAsset.create({
    title: title || 'Untitled',
    description: description || '',
    type: isImage ? 'image' : 'document',
    category: category || 'gallery',
    filename: result.publicId,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    fileSize: result.size,
    dimensions: isImage ? {
      width: result.width,
      height: result.height
    } : undefined,
    url: result.url,
    thumbnailUrl: result.url, // For now use same URL, Cloudinary handles scaling
    cloudinaryId: result.publicId,
    altText: finalAltText, // Use extracted altText or alt
    uploadedBy: req.admin._id,
    status: 'approved', // Auto-approve gallery uploads from admin
    isPublic: isPublic
  });

  const formattedImage = {
    id: newAsset._id,
    src: newAsset.url,
    alt: newAsset.altText,
    title: newAsset.title,
    description: newAsset.description,
    category: newAsset.category,
    uploadDate: newAsset.createdAt,
    size: (newAsset.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
    dimensions: `${newAsset.dimensions.width}x${newAsset.dimensions.height}`,
    cloudinaryId: newAsset.cloudinaryId,
    tags: newAsset.tags || []
  };

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: formattedImage
  });
});

// @desc    Update image details
// @route   PUT /api/gallery/:id
// @access  Private
const updateImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, alt, altText, isPublic, status } = req.body;
  const finalAltText = altText || alt;

  const asset = await MediaAsset.findById(id);

  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Update fields
  if (title) asset.title = title;
  if (description) asset.description = description;
  if (category) asset.category = category;
  if (finalAltText !== undefined) asset.altText = finalAltText;
  if (isPublic !== undefined) asset.isPublic = isPublic;
  if (status) asset.status = status;

  await asset.save();

  const formattedImage = {
    id: asset._id,
    src: asset.url,
    alt: asset.altText,
    title: asset.title,
    description: asset.description,
    category: asset.category,
    uploadDate: asset.createdAt,
    size: (asset.fileSize / (1024 * 1024)).toFixed(2) + ' MB',
    dimensions: asset.dimensions ? `${asset.dimensions.width}x${asset.dimensions.height}` : 'N/A',
    cloudinaryId: asset.cloudinaryId,
    status: asset.status,
    isPublic: asset.isPublic,
    tags: asset.tags || []
  };

  res.status(200).json({
    success: true,
    message: 'Image updated successfully',
    data: formattedImage
  });
});

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const asset = await MediaAsset.findById(id);

  if (!asset) {
    return res.status(404).json({
      success: false,
      message: 'Image not found'
    });
  }

  // Delete from Cloudinary
  if (asset.cloudinaryId) {
    await deleteFromCloudinary(asset.cloudinaryId);
  }

  // Remove from database
  await asset.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully'
  });
});

// @desc    Get gallery statistics
// @route   GET /api/gallery/stats
// @access  Private
const getGalleryStats = asyncHandler(async (req, res) => {
  const stats = await MediaAsset.aggregate([
    { $match: { category: { $in: ['gallery', 'services', 'community', 'events', 'volunteers'] }, type: 'image' } },
    {
      $facet: {
        totalImages: [{ $count: 'count' }],
        categoryStats: [
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        recentUploads: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              title: 1,
              url: 1,
              createdAt: 1,
              category: 1
            }
          }
        ]
      }
    }
  ]);

  const result = {
    totalImages: stats[0].totalImages[0]?.count || 0,
    categories: stats[0].categoryStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    recentUploads: stats[0].recentUploads
  };

  res.status(200).json({
    success: true,
    data: result
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await MediaAsset.distinct('category', { 
    status: 'approved', 
    isPublic: true,
    category: { $in: ['gallery', 'events', 'services', 'community', 'volunteers'] }
  });
  
  // Ensure "gallery" is always present if preferred, or just return distinct
  const result = categories.map(c => c.charAt(0).toUpperCase() + c.slice(1));
  
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  getGalleryImages,
  uploadImage,
  updateImage,
  deleteImage,
  getGalleryStats,
  getCategories
};
