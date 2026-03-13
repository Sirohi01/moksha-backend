// In-memory analytics data (replace with actual database queries in production)
const generateAnalyticsData = () => {
  return {
    overview: {
      totalReports: 1247,
      totalVolunteers: 89,
      totalDonations: 156,
      totalContacts: 234,
      totalUsers: 45,
      activeUsers: 28,
      totalRevenue: 2450000, // in rupees
      conversionRate: 12.5 // percentage
    },
    trends: {
      reports: [
        { month: 'Jan', count: 65, resolved: 58 },
        { month: 'Feb', count: 78, resolved: 71 },
        { month: 'Mar', count: 92, resolved: 85 },
        { month: 'Apr', count: 108, resolved: 98 },
        { month: 'May', count: 134, resolved: 125 },
        { month: 'Jun', count: 156, resolved: 142 }
      ],
      volunteers: [
        { month: 'Jan', count: 12, active: 10 },
        { month: 'Feb', count: 15, active: 13 },
        { month: 'Mar', count: 18, active: 16 },
        { month: 'Apr', count: 22, active: 19 },
        { month: 'May', count: 28, active: 24 },
        { month: 'Jun', count: 35, active: 30 }
      ],
      donations: [
        { month: 'Jan', amount: 45000, count: 23 },
        { month: 'Feb', amount: 52000, count: 28 },
        { month: 'Mar', amount: 48000, count: 25 },
        { month: 'Apr', amount: 61000, count: 32 },
        { month: 'May', amount: 58000, count: 29 },
        { month: 'Jun', amount: 67000, count: 35 }
      ],
      contacts: [
        { month: 'Jan', count: 34, responded: 32 },
        { month: 'Feb', count: 41, responded: 38 },
        { month: 'Mar', count: 38, responded: 35 },
        { month: 'Apr', count: 45, responded: 42 },
        { month: 'May', count: 52, responded: 48 },
        { month: 'Jun', count: 48, responded: 44 }
      ]
    },
    demographics: {
      reportsByState: [
        { state: 'Maharashtra', count: 245, percentage: 19.6 },
        { state: 'Delhi', count: 189, percentage: 15.2 },
        { state: 'Karnataka', count: 167, percentage: 13.4 },
        { state: 'Tamil Nadu', count: 134, percentage: 10.7 },
        { state: 'Gujarat', count: 98, percentage: 7.9 },
        { state: 'Others', count: 414, percentage: 33.2 }
      ],
      volunteersByAge: [
        { ageGroup: '18-25', count: 23, percentage: 25.8 },
        { ageGroup: '26-35', count: 34, percentage: 38.2 },
        { ageGroup: '36-45', count: 28, percentage: 31.5 },
        { ageGroup: '46-55', count: 15, percentage: 16.9 },
        { ageGroup: '55+', count: 12, percentage: 13.5 }
      ],
      donationsByAmount: [
        { range: '₹100-500', count: 45, percentage: 28.8 },
        { range: '₹501-1000', count: 38, percentage: 24.4 },
        { range: '₹1001-5000', count: 42, percentage: 26.9 },
        { range: '₹5001-10000', count: 18, percentage: 11.5 },
        { range: '₹10000+', count: 13, percentage: 8.3 }
      ],
      reportsByCategory: [
        { category: 'Unclaimed Bodies', count: 456, percentage: 36.6 },
        { category: 'Emergency Services', count: 298, percentage: 23.9 },
        { category: 'Support Request', count: 234, percentage: 18.8 },
        { category: 'Information', count: 189, percentage: 15.2 },
        { category: 'Other', count: 70, percentage: 5.6 }
      ]
    },
    performance: {
      responseTime: 2.4, // hours
      resolutionRate: 87.5, // percentage
      satisfactionScore: 4.2, // out of 5
      activeUsers: 156,
      systemUptime: 99.8, // percentage
      averageSessionDuration: 12.5, // minutes
      bounceRate: 23.4, // percentage
      pageLoadTime: 1.8 // seconds
    },
    geographic: {
      topCities: [
        { city: 'Mumbai', state: 'Maharashtra', count: 145 },
        { city: 'Delhi', state: 'Delhi', count: 134 },
        { city: 'Bangalore', state: 'Karnataka', count: 98 },
        { city: 'Chennai', state: 'Tamil Nadu', count: 87 },
        { city: 'Pune', state: 'Maharashtra', count: 76 }
      ],
      ruralVsUrban: {
        urban: { count: 789, percentage: 63.3 },
        rural: { count: 458, percentage: 36.7 }
      }
    },
    timeAnalysis: {
      hourlyActivity: [
        { hour: '00:00', reports: 12, volunteers: 2 },
        { hour: '06:00', reports: 45, volunteers: 8 },
        { hour: '12:00', reports: 89, volunteers: 15 },
        { hour: '18:00', reports: 67, volunteers: 12 }
      ],
      weeklyPattern: [
        { day: 'Monday', reports: 178, volunteers: 12 },
        { day: 'Tuesday', reports: 165, volunteers: 14 },
        { day: 'Wednesday', reports: 189, volunteers: 16 },
        { day: 'Thursday', reports: 201, volunteers: 18 },
        { day: 'Friday', reports: 156, volunteers: 13 },
        { day: 'Saturday', reports: 134, volunteers: 8 },
        { day: 'Sunday', reports: 124, volunteers: 8 }
      ]
    }
  };
};

// @desc    Get analytics overview
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res) => {
  try {
    const { timeRange = '30d', category = 'all' } = req.query;
    
    const analyticsData = generateAnalyticsData();
    
    // Filter data based on time range and category if needed
    // In a real implementation, this would query the database with proper filters
    
    res.status(200).json({
      success: true,
      data: analyticsData,
      timeRange,
      category,
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
    const data = generateAnalyticsData();
    
    res.status(200).json({
      success: true,
      data: data.overview
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
    const { type = 'all', period = '6m' } = req.query;
    const data = generateAnalyticsData();
    
    let trendsData = data.trends;
    
    // Filter by type if specified
    if (type !== 'all' && trendsData[type]) {
      trendsData = { [type]: trendsData[type] };
    }
    
    res.status(200).json({
      success: true,
      data: trendsData,
      period
    });
  } catch (error) {
    console.error('❌ Get analytics trends failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics trends'
    });
  }
};

// @desc    Get analytics demographics
// @route   GET /api/analytics/demographics
// @access  Private
const getAnalyticsDemographics = async (req, res) => {
  try {
    const data = generateAnalyticsData();
    
    res.status(200).json({
      success: true,
      data: data.demographics
    });
  } catch (error) {
    console.error('❌ Get analytics demographics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics demographics'
    });
  }
};

// @desc    Get performance metrics
// @route   GET /api/analytics/performance
// @access  Private
const getPerformanceMetrics = async (req, res) => {
  try {
    const data = generateAnalyticsData();
    
    res.status(200).json({
      success: true,
      data: data.performance
    });
  } catch (error) {
    console.error('❌ Get performance metrics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics'
    });
  }
};

// @desc    Get geographic analytics
// @route   GET /api/analytics/geographic
// @access  Private
const getGeographicAnalytics = async (req, res) => {
  try {
    const data = generateAnalyticsData();
    
    res.status(200).json({
      success: true,
      data: data.geographic
    });
  } catch (error) {
    console.error('❌ Get geographic analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch geographic analytics'
    });
  }
};

// @desc    Get time-based analytics
// @route   GET /api/analytics/time
// @access  Private
const getTimeAnalytics = async (req, res) => {
  try {
    const data = generateAnalyticsData();
    
    res.status(200).json({
      success: true,
      data: data.timeAnalysis
    });
  } catch (error) {
    console.error('❌ Get time analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time analytics'
    });
  }
};

// @desc    Export analytics data
// @route   POST /api/analytics/export
// @access  Private
const exportAnalytics = async (req, res) => {
  try {
    const { format = 'json', timeRange = '30d', sections = ['all'] } = req.body;
    
    const data = generateAnalyticsData();
    
    // Filter data based on requested sections
    let exportData = data;
    if (!sections.includes('all')) {
      exportData = {};
      sections.forEach(section => {
        if (data[section]) {
          exportData[section] = data[section];
        }
      });
    }
    
    const exportInfo = {
      data: exportData,
      metadata: {
        exportDate: new Date(),
        exportedBy: req.admin.name,
        format,
        timeRange,
        sections,
        recordCount: Object.keys(exportData).length
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Analytics data exported successfully',
      data: exportInfo
    });
  } catch (error) {
    console.error('❌ Export analytics failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data'
    });
  }
};

// @desc    Get real-time analytics
// @route   GET /api/analytics/realtime
// @access  Private
const getRealtimeAnalytics = async (req, res) => {
  try {
    // Simulate real-time data
    const realtimeData = {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      currentReports: Math.floor(Math.random() * 20) + 5,
      onlineVolunteers: Math.floor(Math.random() * 15) + 3,
      systemLoad: Math.floor(Math.random() * 30) + 20,
      responseTime: (Math.random() * 2 + 1).toFixed(1),
      lastUpdated: new Date(),
      alerts: [
        {
          type: 'info',
          message: 'New report submitted from Mumbai',
          timestamp: new Date(Date.now() - 2 * 60 * 1000)
        },
        {
          type: 'success',
          message: 'Volunteer registered in Delhi',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        }
      ]
    };
    
    res.status(200).json({
      success: true,
      data: realtimeData
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
  getAnalyticsDemographics,
  getPerformanceMetrics,
  getGeographicAnalytics,
  getTimeAnalytics,
  exportAnalytics,
  getRealtimeAnalytics
};