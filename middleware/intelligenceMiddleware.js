const SystemErrorLog = require('../models/SystemErrorLog');

/**
 * Middleware to track API Latency and store logs for Slow Requests
 */
const monitorPerformance = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log if request is slow (> 1000ms) or an error occurred (4xx, 5xx)
    if (duration > 1000 || statusCode >= 400) {
      try {
        await SystemErrorLog.create({
          message: statusCode >= 500 ? 'Server Error' : statusCode >= 400 ? 'Client Error' : 'Slow Performance',
          path: req.originalUrl,
          method: req.method,
          statusCode,
          duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          userId: req.user ? req.user.id : null,
          metadata: {
            isSlow: duration > 1000,
            query: req.query,
            body: req.method !== 'GET' ? req.body : undefined
          }
        });
      } catch (err) {
        console.error('Failed to save performance log:', err.message);
      }
    }
  });

  next();
};

/**
 * Global Error Logger to be used in errorHandler
 */
const logSystemError = async (err, req, statusCode = 500) => {
  try {
    await SystemErrorLog.create({
      message: err.message || 'Unhandled Exception',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.originalUrl,
      method: req.method,
      statusCode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user ? req.user.id : null,
      metadata: {
        errorName: err.name,
        timestamp: new Date()
      }
    });
  } catch (dbErr) {
    console.error('CRITICAL: Failed to log system error to database:', dbErr.message);
  }
};

module.exports = { monitorPerformance, logSystemError };
