const Contact = require('../models/Contact');
const { sendEmail } = require('../services/emailService');

// @desc    Create new contact inquiry
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    const contact = await Contact.create(contactData);

    // Send confirmation email to user
    await sendEmail(contact.email, 'contactConfirmation', {
      name: contact.name,
      ticketNumber: contact.ticketNumber,
      subject: contact.subject,
      inquiryType: contact.inquiryType
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'contactAdminNotification', {
      name: contact.name,
      ticketNumber: contact.ticketNumber,
      subject: contact.subject,
      inquiryType: contact.inquiryType,
      message: contact.message
    });

    res.status(201).json({
      success: true,
      message: 'Contact inquiry submitted successfully',
      data: {
        ticketNumber: contact.ticketNumber,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Contact creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact inquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all contacts (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.inquiryType) filter.inquiryType = req.query.inquiryType;
    if (req.query.priority) filter.priority = req.query.priority;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get contacts failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts'
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('❌ Get contact failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact inquiry'
    });
  }
};

// @desc    Update contact inquiry status
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContact = async (req, res) => {
  try {
    const { status, priority, notes, responseMessage } = req.body;
    
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact inquiry not found'
      });
    }

    // Update fields
    if (status) contact.status = status;
    if (priority) contact.priority = priority;
    
    // Add response if provided
    if (responseMessage) {
      contact.responseMessage = responseMessage;
      contact.respondedAt = new Date();
      contact.respondedBy = req.admin ? req.admin._id : null;
    }

    // Set assignedTo if moving to in_progress
    if (status === 'in_progress' && req.admin) {
      contact.assignedTo = req.admin._id;
    }
    
    await contact.save();

    // Send response email to user if response message is provided OR status is changed
    if (contact.email && (responseMessage || status)) {
      try {
        console.log('📧 Sending contact email notification...');
        console.log('Email:', contact.email);
        console.log('Status:', status);
        console.log('Response Message:', responseMessage);
        
        if (responseMessage) {
          // Send detailed response email if response message is provided
          console.log('📧 Sending detailed response email...');
          await sendEmail(contact.email, 'contactResponse', {
            name: contact.name,
            ticketNumber: contact.ticketNumber,
            subject: contact.subject,
            responseMessage: responseMessage,
            status: contact.status
          });
        } else if (status && status !== 'new') {
          // Send status update notification if only status is changed
          console.log('📧 Sending status update email...');
          await sendEmail(contact.email, 'contactStatusUpdate', {
            name: contact.name,
            ticketNumber: contact.ticketNumber,
            subject: contact.subject,
            status: contact.status
          });
        }
        console.log('✅ Contact email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send contact email:', emailError);
      }
    } else {
      console.log('⚠️ No email sent - conditions not met');
      console.log('Email exists:', !!contact.email);
      console.log('Response message:', !!responseMessage);
      console.log('Status:', status);
    }

    res.status(200).json({
      success: true,
      message: 'Contact inquiry updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('❌ Update contact failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact inquiry'
    });
  }
};

module.exports = { createContact, getContacts, getContact, updateContact };