const LegacyGiving = require('../models/LegacyGiving');
const { sendEmail } = require('../services/emailService');

// @desc    Create new legacy giving request
// @route   POST /api/legacy
// @access  Public
const createLegacyRequest = async (req, res) => {
  try {
    const legacyRequest = await LegacyGiving.create(req.body);

    // Send confirmation email to requester
    await sendEmail(legacyRequest.email, 'legacyGivingConfirmation', {
      name: legacyRequest.name,
      requestId: legacyRequest.requestId,
      legacyType: legacyRequest.legacyType,
      timeframe: legacyRequest.timeframe
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'legacyGivingAdminNotification', {
      requesterName: legacyRequest.name,
      email: legacyRequest.email,
      phone: legacyRequest.phone,
      requestId: legacyRequest.requestId,
      legacyType: legacyRequest.legacyType,
      estimatedValue: legacyRequest.estimatedValue,
      timeframe: legacyRequest.timeframe
    });

    res.status(201).json({
      success: true,
      message: 'Legacy giving request submitted successfully',
      data: {
        requestId: legacyRequest.requestId,
        status: legacyRequest.status,
        createdAt: legacyRequest.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Legacy request creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit legacy giving request'
    });
  }
};

// @desc    Get all legacy requests (Admin only)
// @route   GET /api/legacy
// @access  Private/Admin
const getLegacyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.legacyType = req.query.type;

    const requests = await LegacyGiving.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LegacyGiving.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get legacy requests failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legacy requests'
    });
  }
};

// @desc    Get single legacy request
// @route   GET /api/legacy/:id
// @access  Private/Admin
const getLegacyRequest = async (req, res) => {
  try {
    const request = await LegacyGiving.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Legacy giving request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('❌ Get legacy request failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch legacy request'
    });
  }
};

// @desc    Update legacy request status
// @route   PUT /api/legacy/:id
// @access  Private/Admin
const updateLegacyRequest = async (req, res) => {
  try {
    const { status, notes, followUpDate } = req.body;
    
    const legacyRequest = await LegacyGiving.findById(req.params.id);
    
    if (!legacyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Legacy giving request not found'
      });
    }

    // Update fields
    if (status) legacyRequest.status = status;
    if (followUpDate) legacyRequest.followUpDate = new Date(followUpDate);
    
    // Add note if provided
    if (notes) {
      legacyRequest.notes.push({
        note: notes,
        addedBy: req.admin ? req.admin._id : null,
        addedAt: new Date()
      });
    }

    // Set assignedTo if moving to contacted or in_discussion
    if ((status === 'contacted' || status === 'in_discussion') && req.admin) {
      legacyRequest.assignedTo = req.admin._id;
    }
    
    await legacyRequest.save();

    // Send status update email to requester
    if (legacyRequest.email && status) {
      try {
        await sendEmail(legacyRequest.email, 'legacyGivingStatusUpdate', {
          name: legacyRequest.name,
          requestId: legacyRequest.requestId,
          legacyType: legacyRequest.legacyType,
          status: legacyRequest.status,
          timeframe: legacyRequest.timeframe
        });
      } catch (emailError) {
        console.error('❌ Failed to send legacy status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Legacy request updated successfully',
      data: legacyRequest
    });

  } catch (error) {
    console.error('❌ Update legacy request failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update legacy request'
    });
  }
};

module.exports = {
  createLegacyRequest,
  getLegacyRequests,
  getLegacyRequest,
  updateLegacyRequest
};