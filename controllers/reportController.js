const Report = require('../models/Report');
const { sendEmail } = require('../services/emailService');
const { uploadToCloudinary } = require('../services/cloudinaryService');

// @desc    Create new report
// @route   POST /api/reports
// @access  Public
const createReport = async (req, res) => {
  try {
    const reportData = { ...req.body };

    // Convert string booleans to actual booleans for FormData
    const booleanFields = ['policeInformed', 'postMortemDone', 'identityDocumentsFound', 'familyContacted', 'agreeToTerms', 'consentToShare'];
    booleanFields.forEach(field => {
      if (reportData[field] === 'true') reportData[field] = true;
      if (reportData[field] === 'false') reportData[field] = false;
    });

    // Clean up empty string fields that should be undefined for enum validation
    if (reportData.reporterRelation === '') {
      delete reportData.reporterRelation; // Remove empty string, let it be undefined
    }

    // Handle file uploads if present
    if (req.files) {
      const fileUploads = {};

      for (const [fieldName, files] of Object.entries(req.files)) {
        if (files && files.length > 0) {
          const file = files[0];
          const uploadResult = await uploadToCloudinary(file, 'reports/documents');
          fileUploads[fieldName] = uploadResult.url;
        }
      }

      // Add uploaded file URLs to report data
      Object.assign(reportData, fileUploads);
    }

    // Create report
    const report = await Report.create(reportData);

    // Send confirmation email
    if (report.reporterEmail) {
      await sendEmail(report.reporterEmail, 'reportConfirmation', {
        reporterName: report.reporterName,
        caseNumber: report.caseNumber,
        exactLocation: report.exactLocation,
        area: report.area,
        city: report.city
      });
    }

    // Send admin notification email
    await sendEmail(process.env.ADMIN_EMAIL, 'reportAdminNotification', {
      reporterName: report.reporterName || 'Anonymous',
      caseNumber: report.caseNumber,
      exactLocation: report.exactLocation,
      area: report.area,
      city: report.city,
      state: report.state,
      reporterPhone: report.reporterPhone,
      reporterEmail: report.reporterEmail
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        caseNumber: report.caseNumber,
        status: report.status,
        createdAt: report.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Report creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.city) filter.city = new RegExp(req.query.city, 'i');
    if (req.query.state) filter.state = new RegExp(req.query.state, 'i');

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get reports failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private/Admin
const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Get report failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
};
const updateReport = async (req, res) => {
  try {
    const { status, notes, assignedTo, priority } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update fields
    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedTo) report.assignedTo = assignedTo;

    // Add note if provided
    if (notes) {
      report.notes.push({
        note: notes,
        addedBy: req.admin ? req.admin._id : null,
        addedAt: new Date()
      });
    }

    // Set response time if moving from pending to in_progress
    if (status === 'in_progress' && report.status === 'pending') {
      report.responseTime = new Date();
    }

    // Set resolved time if moving to resolved
    if (status === 'resolved') {
      report.resolvedAt = new Date();
    }

    await report.save();

    // Send status update email to reporter if email exists
    if (status && report.reporterEmail) {
      try {
        await sendEmail(report.reporterEmail, 'reportStatusUpdate', {
          reporterName: report.reporterName || 'Reporter',
          caseNumber: report.caseNumber,
          status: report.status,
          exactLocation: report.exactLocation,
          city: report.city
        });
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });

  } catch (error) {
    console.error('❌ Update report failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report'
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReport
};