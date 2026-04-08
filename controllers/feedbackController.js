const Feedback = require('../models/Feedback');
const { sendEmail } = require('../services/emailService');
const notificationService = require('../services/notificationService');

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
const createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create(req.body);

    // Send thank you email
    await sendEmail(feedback.email, 'feedbackThankYou', {
      name: feedback.name,
      referenceNumber: feedback.referenceNumber,
      feedbackType: feedback.feedbackType,
      experienceRating: feedback.experienceRating
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'feedbackAdminNotification', {
      name: feedback.name,
      email: feedback.email,
      phone: feedback.phone,
      referenceNumber: feedback.referenceNumber,
      feedbackType: feedback.feedbackType,
      experienceRating: feedback.experienceRating,
      message: feedback.message,
      suggestions: feedback.suggestions
    });

    // 🚀 NEW: Send Real-time Admin System Notification
    await notificationService.createAndNotify({
      title: 'New Feedback Received ⭐️',
      message: `From ${feedback.name}: ${feedback.feedbackType.toUpperCase()} - Rating: ${feedback.experienceRating}/5`,
      type: 'form',
      priority: feedback.experienceRating <= 2 ? 'high' : 'medium',
      link: `/admin/feedback/${feedback._id}`,
      sourceId: feedback._id.toString()
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        referenceNumber: feedback.referenceNumber,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Feedback creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback'
    });
  }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback
// @access  Private/Admin
const getFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.feedbackType) filter.feedbackType = req.query.feedbackType;
    if (req.query.rating) filter.experienceRating = parseInt(req.query.rating);

    const feedback = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// @desc    Get single feedback
// @route   GET /api/feedback/:id
// @access  Private/Admin
const getSingleFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('❌ Get feedback failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback'
    });
  }
};

// @desc    Update feedback status and response
// @route   PUT /api/feedback/:id/status
// @access  Private/Admin
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, responseMessage, priority, tags, isPublic } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update fields
    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;
    if (tags) feedback.tags = tags;
    if (typeof isPublic === 'boolean') feedback.isPublic = isPublic;

    // Add response if provided
    if (responseMessage) {
      feedback.responseMessage = responseMessage;
      feedback.respondedAt = new Date();
      feedback.respondedBy = req.admin ? req.admin._id : null;
    }

    // Set assignedTo if moving to reviewed
    if (status === 'reviewed' && req.admin) {
      feedback.assignedTo = req.admin._id;
    }

    await feedback.save();

    // Send response email to user if response message is provided OR status is changed
    if (feedback.email && (responseMessage || status)) {
      try {
        console.log('📧 Sending feedback email notification...');
        console.log('Email:', feedback.email);
        console.log('Status:', status);
        console.log('Response Message:', responseMessage);

        if (responseMessage) {
          // Send detailed response email if response message is provided
          console.log('📧 Sending detailed response email...');
          await sendEmail(feedback.email, 'feedbackResponse', {
            name: feedback.name,
            referenceNumber: feedback.referenceNumber,
            feedbackType: feedback.feedbackType,
            responseMessage: responseMessage,
            status: feedback.status
          });
        } else if (status && status !== 'new') {
          // Send status update notification if only status is changed
          console.log('📧 Sending status update email...');
          await sendEmail(feedback.email, 'feedbackStatusUpdate', {
            name: feedback.name,
            referenceNumber: feedback.referenceNumber,
            feedbackType: feedback.feedbackType,
            status: feedback.status,
            experienceRating: feedback.experienceRating
          });
        }
        console.log('✅ Feedback email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send feedback email:', emailError);
      }
    } else {
      console.log('⚠️ No email sent - conditions not met');
      console.log('Email exists:', !!feedback.email);
      console.log('Response message:', !!responseMessage);
      console.log('Status:', status);
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('❌ Update feedback failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback'
    });
  }
};
const getPublicTestimonials = async (req, res) => {
  try {
    const feedback = await Feedback.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('❌ Get public testimonials failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials'
    });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  getSingleFeedback,
  updateFeedbackStatus,
  getPublicTestimonials
};