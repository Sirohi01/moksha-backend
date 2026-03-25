const GovernmentScheme = require('../models/GovernmentScheme');
const { sendEmail } = require('../services/emailService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Create new government scheme application
// @route   POST /api/schemes
// @access  Public
const createSchemeApplication = async (req, res) => {
  try {
    const applicationData = { ...req.body };

    // Handle document uploads if present
    if (req.files && req.files.length > 0) {
      const documentsUploaded = [];
      
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file, 'schemes/documents');
        documentsUploaded.push({
          documentType: file.fieldname,
          documentUrl: uploadResult.url,
          uploadedAt: new Date()
        });
      }
      
      applicationData.documentsUploaded = documentsUploaded;
    }

    const application = await GovernmentScheme.create(applicationData);

    // Send confirmation email to applicant
    await sendEmail(application.email, 'schemeApplicationConfirmation', {
      name: application.name,
      applicationId: application.applicationId,
      schemeName: application.schemeName,
      schemeType: application.schemeType,
      status: application.status
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'schemeApplicationAdminNotification', {
      name: application.name,
      email: application.email,
      phone: application.phone,
      applicationId: application.applicationId,
      schemeName: application.schemeName,
      schemeType: application.schemeType,
      incomeCategory: application.incomeCategory,
      city: application.city,
      state: application.state
    });

    res.status(201).json({
      success: true,
      message: 'Government scheme application submitted successfully',
      data: {
        applicationId: application.applicationId,
        status: application.status,
        createdAt: application.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Scheme application creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit scheme application'
    });
  }
};

// @desc    Get all scheme applications (Admin only)
// @route   GET /api/schemes
// @access  Private/Admin
const getSchemeApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.schemeType = req.query.type;
    if (req.query.priority) filter.priority = req.query.priority;

    const applications = await GovernmentScheme.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GovernmentScheme.countDocuments(filter);

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
    console.error('❌ Get scheme applications failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme applications'
    });
  }
};

// @desc    Get single scheme application
// @route   GET /api/schemes/:id
// @access  Private/Admin
const getSchemeApplication = async (req, res) => {
  try {
    const application = await GovernmentScheme.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Scheme application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('❌ Get scheme application failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheme application'
    });
  }
};

// @desc    Update scheme application status
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateSchemeStatus = async (req, res) => {
  try {
    const { status, priority, notes, rejectionReason } = req.body;
    
    const application = await GovernmentScheme.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Scheme application not found'
      });
    }

    // Update fields
    if (status) application.status = status;
    if (priority) application.priority = priority;
    
    // Add note if provided
    if (notes) {
      application.notes.push({
        note: notes,
        addedBy: req.admin ? req.admin._id : null,
        addedAt: new Date()
      });
    }

    // Set rejection reason if rejected
    if (status === 'rejected' && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    // Set review fields if moving to under_review
    if (status === 'under_review' && req.admin) {
      application.assignedTo = req.admin._id;
      application.reviewedBy = req.admin._id;
      application.reviewedAt = new Date();
    }

    // Set approval date if approved
    if (status === 'approved') {
      application.approvalDate = new Date();
    }
    
    await application.save();

    // Send status update email to applicant
    if (application.email && status) {
      try {
        await sendEmail(application.email, 'schemeApplicationStatusUpdate', {
          name: application.name,
          applicationId: application.applicationId,
          schemeName: application.schemeName,
          schemeType: application.schemeType,
          status: application.status
        });
      } catch (emailError) {
        console.error('❌ Failed to send scheme status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Scheme application updated successfully',
      data: application
    });

  } catch (error) {
    console.error('❌ Update scheme application failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scheme application'
    });
  }
};

module.exports = {
  createSchemeApplication,
  getSchemeApplications,
  getSchemeApplication,
  updateSchemeStatus
};