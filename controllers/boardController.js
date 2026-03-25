const BoardApplication = require('../models/BoardApplication');
const { sendEmail } = require('../services/emailService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Create new board application
// @route   POST /api/board
// @access  Public
const createBoardApplication = async (req, res) => {
  try {
    const applicationData = { ...req.body };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.resume && req.files.resume[0]) {
        const resumeUpload = await uploadToCloudinary(req.files.resume[0], 'board/resumes');
        applicationData.resumeUrl = resumeUpload.url;
      }
      
      if (req.files.coverLetter && req.files.coverLetter[0]) {
        const coverLetterUpload = await uploadToCloudinary(req.files.coverLetter[0], 'board/cover-letters');
        applicationData.coverLetterUrl = coverLetterUpload.url;
      }
    }

    const application = await BoardApplication.create(applicationData);

    // Send confirmation email to applicant
    await sendEmail(application.email, 'boardApplicationConfirmation', {
      name: application.name,
      applicationId: application.applicationId,
      positionInterested: application.positionInterested,
      status: application.status
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'boardApplicationAdminNotification', {
      applicantName: application.name,
      email: application.email,
      phone: application.phone,
      applicationId: application.applicationId,
      positionInterested: application.positionInterested,
      experience: application.experience,
      organization: application.organization,
      city: application.city,
      state: application.state,
      qualifications: application.qualifications,
      motivationStatement: application.motivationStatement
    });

    res.status(201).json({
      success: true,
      message: 'Board application submitted successfully',
      data: {
        applicationId: application.applicationId,
        status: application.status,
        createdAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Board application creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit board application'
    });
  }
};

// @desc    Get all board applications (Admin only)
// @route   GET /api/board
// @access  Private/Admin
const getBoardApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.position) filter.positionInterested = req.query.position;

    const applications = await BoardApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BoardApplication.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get board applications failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board applications'
    });
  }
};

// @desc    Get single board application
// @route   GET /api/board/:id
// @access  Private/Admin
const getBoardApplication = async (req, res) => {
  try {
    const application = await BoardApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Board application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('❌ Get board application failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch board application'
    });
  }
};

// @desc    Update board application status
// @route   PUT /api/board/:id
// @access  Private/Admin
const updateBoardApplication = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const application = await BoardApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Board application not found'
      });
    }

    // Update fields
    if (status) application.status = status;
    if (notes) application.notes = notes;
    
    await application.save();

    // Send status update email to applicant
    if (status) {
      console.log(`📧 Sending status update email to ${application.email} for status: ${status}`);
      try {
        const emailResult = await sendEmail(application.email, 'boardApplicationStatusUpdate', {
          name: application.name,
          applicationId: application.applicationId,
          status: application.status,
          positionInterested: application.positionInterested
        });
        console.log('✅ Status update email sent:', emailResult);
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Board application updated successfully',
      data: application
    });

  } catch (error) {
    console.error('❌ Update board application failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update board application'
    });
  }
};

module.exports = {
  createBoardApplication,
  getBoardApplications,
  getBoardApplication,
  updateBoardApplication
};