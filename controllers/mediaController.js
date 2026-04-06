const { uploadToCloudinary, deleteFromCloudinary, cloudinary } = require('../services/cloudinaryService');
const asyncHandler = require('express-async-handler');
const MediaAsset = require('../models/MediaAsset');
const ComplianceDocument = require('../models/ComplianceDocument');
const axios = require('axios');
const getMediaAssets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.isPublic !== undefined) {
    filter.isPublic = req.query.isPublic === 'true';
  }

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
const uploadMediaAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { title, description, type, category, altText, caption, tags, keywords, isPublic, isFeatured } = req.body;

  // STRICT VALIDATION: Ensure SEO compliance and valid categorization
  const validCategories = MediaAsset.schema.path('category').enumValues;
  const sanitizedCategory = validCategories.includes(category) ? category : 'content_assets';
  const sanitizedType = type || 'image'; // Default to image for content forge
  
  // SEO Mandatory: Alt text must exist for images
  const finalAltText = altText || title || (req.file ? req.file.originalname.split('.')[0] : 'Moksha Asset');

  try {
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: `moksha-seva/media/${sanitizedCategory}`,
      resource_type: 'auto'
    });

    const mediaAsset = await MediaAsset.create({
      title: title || req.file.originalname,
      description,
      type: sanitizedType,
      category: sanitizedCategory,
      filename: uploadResult.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: uploadResult.bytes,
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      altText: finalAltText,
      caption,
      uploadedBy: req.admin._id,
      isPublic: isPublic === 'true' || true, // Default to true for content assets
      isFeatured: isFeatured === 'true'
    });

    res.status(201).json({ success: true, data: mediaAsset });
  } catch (error) {
    console.error('Media Storage Failure:', error);
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
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    let path = parts[1];
    path = path.replace(/^v\d+\//, '');
    return path.split('.')[0];
  } catch (e) { return null; }
};
const downloadMediaAsset = asyncHandler(async (req, res) => {
  console.log(`🔍 [DOWNLOAD_PROXY] Pulling manifest: ${req.params.id}`);

  let asset = await ComplianceDocument.findById(req.params.id);
  if (!asset) asset = await MediaAsset.findById(req.params.id);

  if (!asset) return res.status(404).json({ success: false, message: 'Archival node not found' });

  try {
    const targetUrl = asset.fileUrl || asset.url;
    const publicId = extractPublicId(targetUrl);
    const resource = await cloudinary.api.resource(publicId);
    const signedUrl = cloudinary.utils.private_download_url(publicId, resource.format || 'pdf', {
      resource_type: resource.resource_type || 'image',
      type: resource.type || 'upload',
      attachment: true,
      version: resource.version,
      secure: true
    });

    console.log(`📡 [DOWNLOAD_PROXY] Secure Link Dispatch: ${signedUrl}`);

    const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });
    const filename = `${asset.title.replace(/\s+/g, '_')}_Archival.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error(`❌ [DOWNLOAD_PROXY] Failure: ${error.message}`);
    res.status(500).json({ success: false, message: 'Archival Retrieval Failure' });
  }
});

// @desc    Get signed view URL (to bypass 401 in browser)
const viewMediaAsset = asyncHandler(async (req, res) => {
  console.log(`🔍 [VIEW_PROXY] Initializing secure stream for: ${req.params.id}`);

  let asset = await ComplianceDocument.findById(req.params.id);
  if (!asset) asset = await MediaAsset.findById(req.params.id);

  if (!asset) return res.status(404).json({ success: false, message: 'Archival node not found' });

  try {
    const targetUrl = asset.fileUrl || asset.url;
    const publicId = extractPublicId(targetUrl);

    const resource = await cloudinary.api.resource(publicId);

    // Step 2: Unified Signature Strategy
    const signedUrl = cloudinary.utils.private_download_url(publicId, resource.format || 'pdf', {
      resource_type: resource.resource_type || 'image',
      type: resource.type || 'upload',
      version: resource.version,
      secure: true
    });

    console.log(`📡 [VIEW_PROXY] Secure Stream Protocol: ${signedUrl}`);

    const response = await axios.get(signedUrl, { responseType: 'arraybuffer' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Moksha_Archival_Node.pdf"');
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error(`❌ [VIEW_PROXY] Access Failure: ${error.message}`);
    res.status(500).json({ success: false, message: 'Archival Access Mismatch' });
  }
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
  downloadMediaAsset,
  viewMediaAsset,
  bulkUploadAssets,
  updateApprovalStatus,
  getMediaAnalytics
};