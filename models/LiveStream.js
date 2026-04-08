const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the live stream'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  streamType: {
    type: String,
    enum: ['mux', 'youtube', 'external'],
    default: 'youtube'
  },
  muxStreamId: String,
  muxPlaybackId: String,
  muxStreamKey: String,
  externalUrl: String,
  youtubeVideoId: String,

  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'archived'],
    default: 'scheduled'
  },
  thumbnailUrl: String,
  startedAt: Date,
  endedAt: Date,
  isChatEnabled: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
