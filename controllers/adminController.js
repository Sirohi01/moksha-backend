const Report = require('../models/Report');
const Feedback = require('../models/Feedback');
const Volunteer = require('../models/Volunteer');
const Contact = require('../models/Contact');
const Donation = require('../models/Donation');
const BoardApplication = require('../models/BoardApplication');
const LegacyGiving = require('../models/LegacyGiving');
const GovernmentScheme = require('../models/GovernmentScheme');
const ExpansionRequest = require('../models/ExpansionRequest');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get counts for all forms
    const [
      totalReports,
      totalFeedback,
      totalVolunteers,
      totalContacts,
      totalDonations,
      totalBoardApplications,
      totalLegacyRequests,
      totalSchemeApplications,
      totalExpansionRequests
    ] = await Promise.all([
      Report.countDocuments(),
      Feedback.countDocuments(),
      Volunteer.countDocuments(),
      Contact.countDocuments(),
      Donation.countDocuments(),
      BoardApplication.countDocuments(),
      LegacyGiving.countDocuments(),
      GovernmentScheme.countDocuments(),
      ExpansionRequest.countDocuments()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      recentReports,
      recentFeedback,
      recentVolunteers,
      recentContacts,
      recentDonations
    ] = await Promise.all([
      Report.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Feedback.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Volunteer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Contact.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Donation.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);

    // Get donation statistics
    const donationStats = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          avgDonation: { $avg: '$amount' },
          totalDonations: { $sum: 1 }
        }
      }
    ]);

    // Get status distribution for reports
    const reportStatusStats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get priority distribution for reports
    const reportPriorityStats = await Report.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get volunteer status distribution
    const volunteerStatusStats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get feedback rating distribution
    const feedbackRatingStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$experienceRating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReports,
          totalFeedback,
          totalVolunteers,
          totalContacts,
          totalDonations,
          totalBoardApplications,
          totalLegacyRequests,
          totalSchemeApplications,
          totalExpansionRequests
        },
        recentActivity: {
          recentReports,
          recentFeedback,
          recentVolunteers,
          recentContacts,
          recentDonations
        },
        donations: donationStats[0] || { totalAmount: 0, avgDonation: 0, totalDonations: 0 },
        distributions: {
          reportStatus: reportStatusStats,
          reportPriority: reportPriorityStats,
          volunteerStatus: volunteerStatusStats,
          feedbackRatings: feedbackRatingStats
        }
      }
    });

  } catch (error) {
    console.error('❌ Dashboard stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

// @desc    Get recent activities across all forms
// @route   GET /api/admin/recent-activities
// @access  Private/Admin
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent activities from all forms
    const [
      recentReports,
      recentFeedback,
      recentVolunteers,
      recentContacts,
      recentDonations
    ] = await Promise.all([
      Report.find().sort({ createdAt: -1 }).limit(5).select('caseNumber reporterName city createdAt status'),
      Feedback.find().sort({ createdAt: -1 }).limit(5).select('referenceNumber name feedbackType experienceRating createdAt'),
      Volunteer.find().sort({ createdAt: -1 }).limit(5).select('volunteerId name city registrationType createdAt status'),
      Contact.find().sort({ createdAt: -1 }).limit(5).select('ticketNumber name subject createdAt status'),
      Donation.find().sort({ createdAt: -1 }).limit(5).select('donationId name amount paymentStatus createdAt')
    ]);

    // Combine and format activities
    const activities = [
      ...recentReports.map(item => ({
        type: 'report',
        id: item._id,
        title: `New Report: ${item.caseNumber}`,
        description: `Report from ${item.reporterName || 'Anonymous'} in ${item.city}`,
        status: item.status,
        createdAt: item.createdAt
      })),
      ...recentFeedback.map(item => ({
        type: 'feedback',
        id: item._id,
        title: `Feedback: ${item.referenceNumber}`,
        description: `${item.feedbackType} feedback from ${item.name} (${item.experienceRating}⭐)`,
        status: 'new',
        createdAt: item.createdAt
      })),
      ...recentVolunteers.map(item => ({
        type: 'volunteer',
        id: item._id,
        title: `Volunteer: ${item.volunteerId}`,
        description: `${item.registrationType} registration from ${item.name} in ${item.city}`,
        status: item.status,
        createdAt: item.createdAt
      })),
      ...recentContacts.map(item => ({
        type: 'contact',
        id: item._id,
        title: `Contact: ${item.ticketNumber}`,
        description: `${item.subject} from ${item.name}`,
        status: item.status,
        createdAt: item.createdAt
      })),
      ...recentDonations.map(item => ({
        type: 'donation',
        id: item._id,
        title: `Donation: ${item.donationId}`,
        description: `₹${item.amount} from ${item.name}`,
        status: item.paymentStatus,
        createdAt: item.createdAt
      }))
    ];

    // Sort by creation date and limit
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedActivities
    });

  } catch (error) {
    console.error('❌ Recent activities failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
};

// @desc    Get system health status
// @route   GET /api/admin/system-health
// @access  Private/Admin
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      database: 'connected',
      server: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    };

    res.status(200).json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('❌ System health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
  getSystemHealth
};