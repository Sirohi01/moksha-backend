const mongoose = require('mongoose');

const systemErrorLogSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String
  },
  path: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  },
  statusCode: {
    type: Number
  },
  duration: {
    type: Number, // Response time in ms
    hint: 'Latency Monitoring'
  },
  ip: String,
  userAgent: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

systemErrorLogSchema.index({ createdAt: -1 });
systemErrorLogSchema.index({ statusCode: 1 });
systemErrorLogSchema.index({ duration: 1 });
// Auto-expire logs after 30 days to keep DB clean
systemErrorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('SystemErrorLog', systemErrorLogSchema);
