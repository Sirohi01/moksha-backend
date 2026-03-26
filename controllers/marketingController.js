const MarketingCampaign = require('../models/MarketingCampaign');
const MarketingContent = require('../models/MarketingContent');
const UserSegment = require('../models/userSegment');
const asyncHandler = require('express-async-handler');

// @desc    Get all campaigns
const getCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await MarketingCampaign.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
});

// @desc    Create a new campaign
const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await MarketingCampaign.create(req.body);
  res.status(201).json({ success: true, data: campaign });
});

// @desc    Get all marketing content (Banners/Pop-ups)
const getMarketingContent = asyncHandler(async (req, res) => {
  const content = await MarketingContent.find().sort({ isActive: -1, createdAt: -1 });
  res.status(200).json({ success: true, count: content.length, data: content });
});

// @desc    Update a banner/pop-up (including toggle)
const updateMarketingContent = asyncHandler(async (req, res) => {
  const content = await MarketingContent.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
  res.status(200).json({ success: true, data: content });
});

// @desc    Create banner/pop-up
const createMarketingContent = asyncHandler(async (req, res) => {
  const content = await MarketingContent.create(req.body);
  res.status(201).json({ success: true, data: content });
});

// @desc    Delete marketing content
const deleteMarketingContent = asyncHandler(async (req, res) => {
  await MarketingContent.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

// @desc    Toggle banner/pop-up status
const toggleContentStatus = asyncHandler(async (req, res) => {
  const content = await MarketingContent.findById(req.params.id);
  if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
  content.isActive = !content.isActive;
  await content.save();
  res.status(200).json({ success: true, data: content });
});

// @desc    Get user segments
const getSegments = asyncHandler(async (req, res) => {
  const segments = await UserSegment.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: segments });
});

// @desc    Create user segment
const createSegment = asyncHandler(async (req, res) => {
  const segment = await UserSegment.create(req.body);
  res.status(201).json({ success: true, data: segment });
});

// @desc    Get active marketing content (Public)
const getActiveMarketingContent = asyncHandler(async (req, res) => {
  const content = await MarketingContent.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: content.length, data: content });
});

module.exports = {
  getCampaigns,
  createCampaign,
  getMarketingContent,
  updateMarketingContent,
  createMarketingContent,
  deleteMarketingContent,
  toggleContentStatus,
  getSegments,
  createSegment,
  getActiveMarketingContent
};
