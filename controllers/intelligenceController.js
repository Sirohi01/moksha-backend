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

  const { startDate, endDate, search } = req.query;
  const filter = {};
  
  if (search && search.trim()) {
    filter.errorMessage = new RegExp(search.trim(), 'i');
  }

  if ((startDate && startDate.trim()) || (endDate && endDate.trim())) {
    const dateFilter = {};
    if (startDate && startDate.trim()) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) dateFilter.$gte = start;
    }
    if (endDate && endDate.trim()) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }
    if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;
  }

  const logs = await SystemErrorLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await SystemErrorLog.countDocuments(filter);

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

  const { startDate, endDate, type, status, mode = 'alerts', search } = req.query;
  const filter = {};

  if (search && search.trim()) {
    filter.content = new RegExp(search.trim(), 'i');
  }

  if ((startDate && startDate.trim()) || (endDate && endDate.trim())) {
    const dateFilter = {};
    if (startDate && startDate.trim()) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) dateFilter.$gte = start;
    }
    if (endDate && endDate.trim()) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        end.setUTCHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }
    if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;
  }

  if (mode === 'interactions') {
    const logs = await PublicInteraction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PublicInteraction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  }

  if (type) filter.type = type;
  if (status) filter.status = status;

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
