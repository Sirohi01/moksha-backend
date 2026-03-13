const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/admin/activities
// @access  Private/Manager
const getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.targetType) filter.targetType = req.query.targetType;
    if (req.query.status) filter.status = req.query.status;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const activities = await ActivityLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(filter);

    // Map the data to match frontend expectations
    const mappedActivities = activities.map(activity => ({
      _id: activity._id,
      adminId: activity.userId?._id || activity.userId,
      adminName: activity.userId?.name || 'Unknown User',
      action: activity.action,
      resource: activity.targetType || 'system',
      resourceId: activity.targetId,
      details: activity.description || `${activity.action} ${activity.targetType || 'system'}`,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent || 'Unknown',
      timestamp: activity.createdAt,
      status: activity.status || 'success'
    }));

    res.status(200).json({
      success: true,
      data: mappedActivities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get activities failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities'
    });
  }
};

// @desc    Get activity statistics
// @route   GET /api/admin/activities/stats
// @access  Private/Manager
const getActivityStats = async (req, res) => {
  try {
    const timeRange = req.query.range || '7d'; // 1d, 7d, 30d, 90d
    
    let startDate;
    switch (timeRange) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Activity by action
    const actionStats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Activity by user
    const userStats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, userEmail: { $first: '$userEmail' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Activity by hour (for today)
    const hourlyStats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Error rate
    const errorStats = await ActivityLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        actionStats,
        userStats,
        hourlyStats,
        errorStats,
        timeRange
      }
    });

  } catch (error) {
    console.error('❌ Get activity stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity statistics'
    });
  }
};

// @desc    Get activity by ID
// @route   GET /api/admin/activities/:id
// @access  Private/Manager
const getActivityById = async (req, res) => {
  try {
    const activity = await ActivityLog.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Map the data to match frontend expectations
    const mappedActivity = {
      _id: activity._id,
      adminId: activity.userId?._id || activity.userId,
      adminName: activity.userId?.name || 'Unknown User',
      action: activity.action,
      resource: activity.targetType || 'system',
      resourceId: activity.targetId,
      details: activity.description || `${activity.action} ${activity.targetType || 'system'}`,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent || 'Unknown',
      timestamp: activity.createdAt,
      status: activity.status || 'success'
    };

    res.status(200).json({
      success: true,
      data: mappedActivity
    });

  } catch (error) {
    console.error('❌ Get activity by ID failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity'
    });
  }
};

module.exports = {
  getActivities,
  getActivityStats,
  getActivityById
};