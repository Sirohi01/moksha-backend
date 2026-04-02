const ActivityLog = require('../models/ActivityLog');

// Middleware to log user activities
const logActivity = (action, targetType = null, description = null) => {
  return async (req, res, next) => {
    // Store activity info in request for later logging
    req.activityInfo = {
      action,
      targetType,
      description,
      startTime: Date.now()
    };
    
    // Override res.json to capture response and log activity
    const originalJson = res.json;
    res.json = function(data) {
      // Log the activity after response
      setImmediate(async () => {
        try {
          // Identify user either from req.admin (if logged in) or from successful login response
          let currentUser = req.admin;
          if (!currentUser && data && data.success && data.data && data.data.admin) {
            currentUser = {
              _id: data.data.admin.id || data.data.admin._id,
              email: data.data.admin.email,
              role: data.data.admin.role
            };
          }

          if (currentUser && req.activityInfo) {
            const duration = Date.now() - req.activityInfo.startTime;
            
            const logData = {
              userId: currentUser._id,
              userEmail: currentUser.email,
              userRole: currentUser.role,
              action: req.activityInfo.action,
              targetType: req.activityInfo.targetType,
              targetId: req.params.id || req.body.id || (data && data.data && data.data.id ? data.data.id : null),
              targetName: req.body.name || req.body.title || null,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              method: req.method,
              endpoint: req.originalUrl,
              description: req.activityInfo.description,
              duration,
              status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed',
              pageUrl: req.get('Referer'),
              metadata: {
                requestBody: req.method !== 'GET' ? req.body : null,
                queryParams: req.query,
                responseStatus: res.statusCode
              }
            };

            // Add error message if failed
            if (res.statusCode >= 400) {
              logData.errorMessage = data.message || 'Unknown error';
              logData.status = 'error';
            }

            console.log(`[ActivityLogger] Attempting to log: ${logData.action} by ${logData.userEmail}`);
            const newLog = await ActivityLog.create(logData);
            console.log(`[ActivityLogger] Log saved successfully: ${newLog._id}`);
          } else {
            console.log(`[ActivityLogger] Skipping log: No user or activityInfo found.`);
          }
        } catch (error) {
          console.error('❌ Activity logging failed:', error);
        }
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Log page visits and time spent
const logPageVisit = async (req, res, next) => {
  if (req.admin) {
    try {
      await ActivityLog.create({
        userId: req.admin._id,
        userEmail: req.admin.email,
        userRole: req.admin.role,
        action: 'page_visit',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        pageUrl: req.originalUrl,
        description: `Visited ${req.originalUrl}`,
        status: 'success'
      });
    } catch (error) {
      console.error('❌ Page visit logging failed:', error);
    }
  }
  next();
};

// Batch log multiple activities
const batchLogActivities = async (activities) => {
  try {
    await ActivityLog.insertMany(activities);
  } catch (error) {
    console.error('❌ Batch activity logging failed:', error);
  }
};

module.exports = {
  logActivity,
  logPageVisit,
  batchLogActivities
};