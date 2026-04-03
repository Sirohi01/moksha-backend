const VisitorActivity = require('../models/VisitorActivity');
const geoip = require('geoip-lite');

// Track user activity
exports.trackActivity = async (req, res) => {
  try {
    const { sessionId, path, events, duration, startTime, endTime, isNewSession, referer } = req.body;

    // Get IP Address from request
    let ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // Clean up IPv6 localhost or proxied IPs
    if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
      ipAddress = '127.0.0.1';
    } else if (ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
    }

    const userAgent = req.headers['user-agent'];

    // Get geolocation from IP
    let location = { city: 'Unknown', region: 'Unknown', country: 'Unknown' };
    if (ipAddress !== '127.0.0.1') {
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        location = {
          city: geo.city || 'Unknown',
          region: geo.region || 'Unknown',
          country: geo.country || 'Unknown'
        };
      }
    }

    // Optimization Theory: If this is a click-event coming from the same session and page,
    // we should append it to the existing page-view document instead of creating a new one.
    // This prevents "Stats Inflation" and "Database Bloat".

    // Look for an existing document for this session and path updated in the last 30 minutes
    let activity = await VisitorActivity.findOne({
      sessionId,
      path,
      updatedAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
    }).sort({ updatedAt: -1 });

    if (activity && !isNewSession) {
      // Update existing record
      if (events && events.length > 0) {
        activity.events.push(...events);
      }
      if (duration) activity.duration = duration;
      if (endTime) activity.endTime = endTime;
      await activity.save();
    } else {
      // Create the activity record
      activity = new VisitorActivity({
        sessionId,
        ipAddress,
        userAgent,
        path,
        referer,
        startTime: startTime || new Date(),
        endTime,
        duration: duration || 0,
        events: events || [],
        location,
        isNewSession: !!isNewSession
      });
      await activity.save();
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track Activity Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get stats for admin panel
exports.getVisitorStats = async (req, res) => {
  try {
    const { timeRange = '24h', customStart, customEnd } = req.query;
    let startDate = new Date();
    let endDate = new Date();

    if ((customStart && customStart.trim()) || (customEnd && customEnd.trim())) {
      if (customStart && customStart.trim()) {
        startDate = new Date(customStart);
        startDate.setUTCHours(0, 0, 0, 0);
      }
      if (customEnd && customEnd.trim()) {
        endDate = new Date(customEnd);
        endDate.setUTCHours(23, 59, 59, 999);
      }
    } else {
      if (timeRange === '24h') startDate.setHours(startDate.getHours() - 24);
      else if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30);
      else startDate.setHours(startDate.getHours() - 24); // default 24h
    }

    const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };

    // Get basic stats
    const totalViews = await VisitorActivity.countDocuments({
      ...dateFilter,
      'events.type': 'page_view'
    });

    const uniqueIPs = await VisitorActivity.distinct('ipAddress', dateFilter);
    const uniqueSessions = await VisitorActivity.distinct('sessionId', dateFilter);

    // Get recent activities - Group by IP to show Unique Explorers/Visitors instead of every single session
    const recentActivities = await VisitorActivity.aggregate([
      { $match: dateFilter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$ipAddress',
          ipAddress: { $first: '$ipAddress' },
          path: { $first: '$path' },
          startTime: { $first: '$startTime' },
          duration: { $first: '$duration' },
          events: { $first: '$events' },
          sessionId: { $first: '$sessionId' }
        }
      },
      { $sort: { startTime: -1 } },
      { $limit: 50 }
    ]);

    // Get popular pages
    const popularPages = await VisitorActivity.aggregate([
      { $match: { ...dateFilter, 'events.type': 'page_view' } },
      { $group: { _id: '$path', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get top clicking buttons
    const topButtons = await VisitorActivity.aggregate([
      { $match: dateFilter },
      { $unwind: '$events' },
      { $match: { 'events.type': 'click' } },
      { $group: { _id: '$events.targetText', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalViews,
          uniqueIPs: uniqueIPs.length,
          uniqueSessions: uniqueSessions.length
        },
        recentActivities,
        popularPages,
        topButtons
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get specific visitor details by IP
exports.getVisitorDetailsByIP = async (req, res) => {
  try {
    const { ip } = req.params;
    const activities = await VisitorActivity.find({ ipAddress: ip })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get Visitor Details Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};