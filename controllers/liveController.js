const asyncHandler = require('express-async-handler');
const LiveStream = require('../models/LiveStream');
const LiveChatMessage = require('../models/LiveChatMessage');
const Mux = require('@mux/mux-node');

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET
});

// @desc    Create new live stream
// @route   POST /api/live/create
// @access  Private/Admin
const createLiveStream = asyncHandler(async (req, res) => {
  const { title, description, streamType, youtubeVideoId, externalUrl } = req.body;

  let muxStreamData = null;
  
  if (streamType === 'mux') {
    try {
      const liveStream = await mux.video.liveStreams.create({
        playback_policy: ['public'],
        new_asset_settings: { playback_policy: ['public'] },
      });
      muxStreamData = liveStream;
    } catch (error) {
       console.error('Mux Error:', error.message);
       res.status(500);
       throw new Error(`Mux Stream Creation Failed: ${error.message}`);
    }
  }

  const stream = await LiveStream.create({
    title,
    description,
    streamType,
    youtubeVideoId: streamType === 'youtube' ? youtubeVideoId : null,
    externalUrl: streamType === 'external' ? externalUrl : null,
    muxStreamId: muxStreamData ? muxStreamData.id : null,
    muxPlaybackId: muxStreamData ? muxStreamData.playback_ids?.[0]?.id : null,
    muxStreamKey: muxStreamData ? muxStreamData.stream_key : null,
    status: 'scheduled',
    createdBy: req.admin._id
  });

  res.status(201).json({
    success: true,
    data: stream
  });
});

// @desc    Get active live stream
// @route   GET /api/live/active
// @access  Public
const getActiveStream = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findOne({ status: 'live' }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: stream });
});

// @desc    Get all streams for admin
// @route   GET /api/live/all
// @access  Private/Admin
const getAllStreams = asyncHandler(async (req, res) => {
  const streams = await LiveStream.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: streams });
});

// @desc    Update stream status
// @route   PATCH /api/live/:id/status
// @access  Private/Admin
const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const stream = await LiveStream.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.status(200).json({ success: true, data: stream });
});

// @desc    Get chat messages for a stream
// @route   GET /api/live/:id/messages
// @access  Public
const getStreamMessages = asyncHandler(async (req, res) => {
  const messages = await LiveChatMessage.find({ streamId: req.params.id }).sort({ createdAt: 1 });
  res.status(200).json({ success: true, data: messages });
});

// @desc    Delete a live stream
// @route   DELETE /api/live/:id
// @access  Private/Admin
const deleteLiveStream = asyncHandler(async (req, res) => {
  const stream = await LiveStream.findById(req.params.id);

  if (!stream) {
    res.status(404);
    throw new Error('Stream not found');
  }

  // Mux Cleanup
  if (stream.streamType === 'mux' && stream.muxStreamId) {
    try {
      await mux.video.liveStreams.delete(stream.muxStreamId);
    } catch (error) {
      console.error('Mux Cleanup Failed:', error.message);
    }
  }

  await stream.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Stream deleted from mission control'
  });
});

// @desc    Delete a specific chat message
// @route   DELETE /api/live/message/:messageId
// @access  Private/Admin
const deleteStreamMessage = asyncHandler(async (req, res) => {
  const message = await LiveChatMessage.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Message redacted successfully'
  });
});

module.exports = {
  createLiveStream,
  getActiveStream,
  getAllStreams,
  updateStatus,
  getStreamMessages,
  deleteLiveStream,
  deleteStreamMessage
};
