const mongoose = require('mongoose');

const BroadcastScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  mediaUrl: String,
  mediaType: String,
  recurrence: {
    type: String,
    enum: ['once', 'weekly', 'monthly'],
    default: 'once'
  },
  dayOfWeek: {
    type: Number, // 0 = Sunday
    default: 0
  },
  scheduledTime: {
    type: String, // "09:00"
    default: "09:00"
  },
  targetRoles: [String],
  targetCities: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: Date,
  nextRun: Date
}, { timestamps: true });

module.exports = mongoose.model('BroadcastSchedule', BroadcastScheduleSchema);
