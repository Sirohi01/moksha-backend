const Volunteer = require('../models/Volunteer');
const { sendEmail } = require('../services/emailService');

// @desc    Create new volunteer application
// @route   POST /api/volunteers
// @access  Public
const createVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);

    // Send welcome email to volunteer
    await sendEmail(volunteer.email, 'volunteerWelcome', {
      name: volunteer.name,
      volunteerId: volunteer.volunteerId,
      registrationType: volunteer.registrationType,
      status: volunteer.status,
      volunteerTypes: volunteer.volunteerTypes
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'volunteerAdminNotification', {
      name: volunteer.name,
      volunteerId: volunteer.volunteerId,
      registrationType: volunteer.registrationType,
      volunteerTypes: volunteer.volunteerTypes,
      city: volunteer.city,
      state: volunteer.state
    });

    res.status(201).json({
      success: true,
      message: 'Volunteer application submitted successfully',
      data: {
        volunteerId: volunteer.volunteerId,
        status: volunteer.status,
        createdAt: volunteer.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Volunteer creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit volunteer application',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all volunteers (Admin only)
// @route   GET /api/volunteers
// @access  Private/Admin
const getVolunteers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.state) filter.state = new RegExp(req.query.state, 'i');
    if (req.query.registrationType) filter.registrationType = req.query.registrationType;

    const volunteers = await Volunteer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Volunteer.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get volunteers failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteers'
    });
  }
};

// @desc    Get single volunteer
// @route   GET /api/volunteers/:id
// @access  Private/Admin
const getVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: volunteer
    });

  } catch (error) {
    console.error('❌ Get volunteer failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer'
    });
  }
};

// @desc    Update volunteer status
// @route   PUT /api/volunteers/:id/status
// @access  Private/Admin
const updateVolunteerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'approved' && { approvedAt: new Date() }),
        ...(status === 'rejected' && req.body.rejectionReason && { rejectionReason: req.body.rejectionReason })
      },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    // Send status update email
    await sendEmail(volunteer.email, 'volunteerStatusUpdate', {
      name: volunteer.name,
      status: status,
      volunteerId: volunteer.volunteerId,
      rejectionReason: req.body.rejectionReason
    });

    res.status(200).json({
      success: true,
      message: 'Volunteer status updated successfully',
      data: volunteer
    });

  } catch (error) {
    console.error('❌ Update volunteer status failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update volunteer status'
    });
  }
};

module.exports = { createVolunteer, getVolunteers, getVolunteer, updateVolunteerStatus };