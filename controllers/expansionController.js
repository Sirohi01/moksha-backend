const ExpansionRequest = require('../models/ExpansionRequest');
const { sendEmail } = require('../services/emailService');
const createExpansionRequest = async (req, res) => {
  try {
    const expansionRequest = await ExpansionRequest.create(req.body);
    await sendEmail(expansionRequest.email, 'expansionRequestConfirmation', {
      name: expansionRequest.name,
      requestId: expansionRequest.requestId,
      requestedCity: expansionRequest.requestedCity,
      requestedState: expansionRequest.requestedState,
      status: expansionRequest.status
    });
    await sendEmail(process.env.ADMIN_EMAIL, 'expansionRequestAdminNotification', {
      name: expansionRequest.name,
      email: expansionRequest.email,
      phone: expansionRequest.phone,
      requestId: expansionRequest.requestId,
      requestedCity: expansionRequest.requestedCity,
      requestedState: expansionRequest.requestedState,
      localSupport: expansionRequest.localSupport,
      organization: expansionRequest.organization,
      urgencyLevel: expansionRequest.urgencyLevel,
      whyNeeded: expansionRequest.whyNeeded
    });

    res.status(201).json({
      success: true,
      message: 'Expansion request submitted successfully',
      data: {
        requestId: expansionRequest.requestId,
        status: expansionRequest.status,
        createdAt: expansionRequest.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Expansion request creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit expansion request'
    });
  }
};

// @desc    Get all expansion requests (Admin only)
// @route   GET /api/expansion
// @access  Private/Admin
const getExpansionRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.state) filter.requestedState = new RegExp(req.query.state, 'i');

    const requests = await ExpansionRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ExpansionRequest.countDocuments(filter);

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
    console.error('❌ Get expansion requests failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expansion requests'
    });
  }
};

// @desc    Get single expansion request
// @route   GET /api/expansion/:id
// @access  Private/Admin
const getExpansionRequest = async (req, res) => {
  try {
    const request = await ExpansionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Expansion request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('❌ Get expansion request failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expansion request'
    });
  }
};

// @desc    Update expansion request status
// @route   PUT /api/expansion/:id
// @access  Private/Admin
const updateExpansionRequest = async (req, res) => {
  try {
    const { status, priority, notes, feasibilityScore, estimatedCost, rejectionReason } = req.body;
    
    const expansionRequest = await ExpansionRequest.findById(req.params.id);
    
    if (!expansionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Expansion request not found'
      });
    }

    // Update fields
    if (status) {
      expansionRequest.status = status;
      if (status === 'approved') {
        expansionRequest.approvalDate = new Date();
      }
      if (status === 'rejected' && rejectionReason) {
        expansionRequest.rejectionReason = rejectionReason;
      }
    }
    
    if (priority) expansionRequest.priority = priority;
    if (feasibilityScore) expansionRequest.feasibilityScore = feasibilityScore;
    if (estimatedCost) expansionRequest.estimatedCost = estimatedCost;
    
    // Add note if provided
    if (notes) {
      expansionRequest.notes.push({
        note: notes,
        addedBy: req.admin ? req.admin._id : null,
        addedAt: new Date()
      });
    }

    // Set reviewedBy and reviewedAt
    if (req.admin) {
      expansionRequest.reviewedBy = req.admin._id;
      expansionRequest.reviewedAt = new Date();
    }
    
    await expansionRequest.save();

    // Send status update email to requester
    if (expansionRequest.email && status) {
      try {
        await sendEmail(expansionRequest.email, 'expansionRequestStatusUpdate', {
          name: expansionRequest.name,
          requestId: expansionRequest.requestId,
          requestedCity: expansionRequest.requestedCity,
          requestedState: expansionRequest.requestedState,
          status: expansionRequest.status
        });
      } catch (emailError) {
        console.error('❌ Failed to send expansion status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Expansion request updated successfully',
      data: expansionRequest
    });

  } catch (error) {
    console.error('❌ Update expansion request failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expansion request'
    });
  }
};

module.exports = {
  createExpansionRequest,
  getExpansionRequests,
  getExpansionRequest,
  updateExpansionRequest
};