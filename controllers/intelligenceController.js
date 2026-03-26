const SystemErrorLog = require('../models/SystemErrorLog');
const CommunicationLog = require('../models/CommunicationLog');
const PublicInteraction = require('../models/PublicInteraction');
const geoip = require('geoip-lite');
const asyncHandler = require('express-async-handler');

/**
 * Record a public interaction (button click)
 * @route POST /api/intelligence/track-interaction
 */
const recordInteraction = asyncHandler(async (req, res) => {
  const { platform, pageUrl } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const location = geoip.lookup(ip);

  const interaction = await PublicInteraction.create({
    platform,
    ipAddress: ip,
    userAgent,
    pageUrl,
    location: location ? {
      city: location.city,
      region: location.region,
      country: location.country
    } : undefined
  });

  res.status(201).json({ success: true, data: interaction });
});

/**
 * Get interaction analytics summary
 * @route GET /api/intelligence/interaction-stats
 */
const getInteractionAnalytics = asyncHandler(async (req, res) => {
  const stats = await PublicInteraction.aggregate([
    {
      $group: {
        _id: "$platform",
        count: { $sum: 1 }
      }
    }
  ]);

  const recent = await PublicInteraction.find()
    .sort({ createdAt: -1 })
    .limit(30);

  res.status(200).json({ success: true, stats, recent });
});

// @desc    Get system error logs
// @route   GET /api/intelligence/error-logs
// @access  Private/Admin
const getErrorLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const logs = await SystemErrorLog.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SystemErrorLog.countDocuments();

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get communication logs (SMS/WhatsApp)
// @route   GET /api/intelligence/communication-logs
// @access  Private/Admin
const getCommunicationLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const mode = req.query.mode || 'alerts'; // alerts (traditional) or interactions

  if (mode === 'interactions') {
    const logs = await PublicInteraction.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PublicInteraction.countDocuments();

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  }

  const filter = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;

  const logs = await CommunicationLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CommunicationLog.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get performance metrics summary
// @route   GET /api/intelligence/performance-summary
const getPerformanceSummary = asyncHandler(async (req, res) => {
  const stats = await SystemErrorLog.aggregate([
    {
      $group: {
        _id: null,
        avgLatency: { $avg: "$duration" },
        maxLatency: { $max: "$duration" },
        totalErrors: { 
          $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } 
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || { avgLatency: 0, maxLatency: 0, totalErrors: 0 }
  });
});

module.exports = {
  getErrorLogs,
  getCommunicationLogs,
  getPerformanceSummary,
  recordInteraction,
  getInteractionAnalytics
};
