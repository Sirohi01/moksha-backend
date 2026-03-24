const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Admin = require('../models/Admin');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get analytics overview
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const totalDonations = await Donation.countDocuments();
    const totalAdmins = await Admin.countDocuments();
    const totalTasks = await Task.countDocuments();

    // Trends for reports (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const reportTrends = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const donationStats = await Donation.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const analyticsData = {
      overview: {
        totalReports,
        totalVolunteers,
        totalDonations: donationStats.length > 0 ? donationStats[0].count : 0,
        totalRevenue: donationStats.length > 0 ? donationStats[0].totalAmount : 0,
        totalAdmins,
        totalTasks
      },
      trends: {
        reports: reportTrends.map(t => ({
          month: new Date(0, t._id.month - 1).toLocaleString('default', { month: 'short' }),
          count: t.count,
          resolved: t.resolved
        }))
      },
      demographics: {
        reportsByCategory: await Report.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $project: { category: "$_id", count: 1, _id: 0 } }
        ])
      }
    };

    res.status(200).json({
      success: true,
      data: analyticsData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('❌ Get analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

// @desc    Get analytics overview summary
// @route   GET /api/analytics/overview
// @access  Private
const getAnalyticsOverview = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const totalVolunteers = await Volunteer.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalAdmins = await Admin.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        totalVolunteers,
        totalTasks,
        totalAdmins
      }
    });
  } catch (error) {
    console.error('❌ Get analytics overview failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview'
    });
  }
};

// @desc    Get analytics trends
// @route   GET /api/analytics/trends
// @access  Private
const getAnalyticsTrends = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          reports: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('❌ Get analytics trends failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics trends'
    });
  }
};

// @desc    Get real-time analytics
// @route   GET /api/analytics/realtime
// @access  Private
const getRealtimeAnalytics = async (req, res) => {
  try {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentReports = await Report.countDocuments({ createdAt: { $gte: last24Hours } });
    const recentVolunteers = await Volunteer.countDocuments({ createdAt: { $gte: last24Hours } });
    
    const recentActivity = await ActivityLog.find()
      .populate('admin', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        activeReports24h: recentReports,
        newVolunteers24h: recentVolunteers,
        recentActivity: recentActivity.map(a => ({
          type: a.action,
          message: `${a.admin ? a.admin.name : 'System'} ${a.action} ${a.module}`,
          timestamp: a.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('❌ Get realtime analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch realtime analytics'
    });
  }
};

module.exports = {
  getAnalytics,
  getAnalyticsOverview,
  getAnalyticsTrends,
  getRealtimeAnalytics,
  // Placeholders for compatibility if other routes exist
  getAnalyticsDemographics: (req, res) => res.status(200).json({ success: true, data: {} }),
  getPerformanceMetrics: (req, res) => res.status(200).json({ success: true, data: {} }),
  getGeographicAnalytics: (req, res) => res.status(200).json({ success: true, data: {} }),
  getTimeAnalytics: (req, res) => res.status(200).json({ success: true, data: {} }),
  exportAnalytics: (req, res) => res.status(200).json({ success: true, message: 'Export scheduled' })
};