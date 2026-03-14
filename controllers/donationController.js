const Donation = require('../models/Donation');
const { sendEmail } = require('../services/emailService');
const { generateReceiptPDF } = require('../services/pdfService');

// @desc    Create new donation
// @route   POST /api/donations
// @access  Public
const createDonation = async (req, res) => {
  try {
    const donationData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      paymentDate: new Date()
    };

    const donation = await Donation.create(donationData);

    // Send donation confirmation email
    await sendEmail(donation.email, 'donationConfirmation', {
      name: donation.name,
      donationId: donation.donationId,
      amount: donation.amount,
      currency: donation.currency,
      paymentMethod: donation.paymentMethod,
      receiptNumber: donation.receiptNumber
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'donationAdminNotification', {
      donorName: donation.name,
      donationId: donation.donationId,
      amount: donation.amount,
      paymentMethod: donation.paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Donation processed successfully',
      data: {
        donationId: donation.donationId,
        receiptNumber: donation.receiptNumber,
        status: donation.paymentStatus,
        createdAt: donation.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Donation creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation'
    });
  }
};

// @desc    Get all donations (Admin only)
// @route   GET /api/donations
// @access  Private/Admin
const getDonations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.paymentStatus = req.query.status;
    if (req.query.type) filter.donationType = req.query.type;
    if (req.query.purpose) filter.purpose = req.query.purpose;

    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(filter);

    // Calculate statistics
    const stats = await Donation.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          avgDonation: { $avg: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || { totalAmount: 0, totalDonations: 0, avgDonation: 0 }
    });

  } catch (error) {
    console.error('❌ Get donations failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations'
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Private/Admin
const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('❌ Get donation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation'
    });
  }
};

// @desc    Update donation payment status
// @route   PUT /api/donations/:id/payment
// @access  Public
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId, orderId, signature, status } = req.body;
    
    const donation = await Donation.findOne({ donationId: req.params.id });
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Update payment details
    donation.paymentStatus = status;
    donation.paymentId = paymentId;
    donation.razorpayOrderId = orderId;
    donation.razorpaySignature = signature;
    donation.paymentDate = new Date();
    
    await donation.save();

    // Send payment confirmation email if completed
    if (status === 'completed') {
      await sendEmail(donation.email, 'paymentConfirmation', {
        name: donation.donorName,
        donationId: donation.donationId,
        amount: donation.amount,
        currency: donation.currency,
        paymentId: paymentId,
        receiptNumber: donation.receiptNumber
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        donationId: donation.donationId,
        paymentStatus: donation.paymentStatus,
        receiptNumber: donation.receiptNumber
      }
    });

  } catch (error) {
    console.error('❌ Payment status update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
};

// @desc    Send receipt via email
// @route   POST /api/donations/:id/email-receipt
// @access  Private/Admin
const emailReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Generate PDF receipt
    console.log('📄 Generating PDF receipt...');
    const pdfBuffer = await generateReceiptPDF(donation);
    
    // Send receipt email with PDF attachment
    const emailResult = await sendEmail(donation.email, 'donationReceiptWithPDF', {
      name: donation.name,
      donationId: donation.donationId,
      receiptNumber: donation.receiptNumber,
      amount: donation.amount.toLocaleString('en-IN'),
      currency: donation.currency,
      paymentMethod: donation.paymentMethod.toUpperCase(),
      paymentStatus: donation.paymentStatus,
      donationType: donation.donationType.replace('_', ' ').toUpperCase(),
      purpose: donation.purpose.replace('_', ' ').toUpperCase(),
      createdAt: new Date(donation.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }, {
      filename: `Receipt-${donation.receiptNumber}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: `Receipt with PDF sent successfully to ${donation.email}`,
        messageId: emailResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: `Failed to send email: ${emailResult.error}`
      });
    }

  } catch (error) {
    console.error('❌ Email receipt failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt email. Please check server configuration.'
    });
  }
};

// @desc    Process refund
// @route   POST /api/donations/:id/refund
// @access  Private/Admin
const refundDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    if (donation.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed donations can be refunded'
      });
    }

    if (donation.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Donation has already been refunded'
      });
    }

    // Update donation status
    donation.paymentStatus = 'refunded';
    donation.refundDate = new Date();
    donation.refundReason = req.body.reason || 'Admin initiated refund';
    
    await donation.save();

    // Send refund confirmation email
    await sendEmail(donation.email, 'refundConfirmation', {
      name: donation.name,
      donationId: donation.donationId,
      amount: donation.amount,
      currency: donation.currency,
      refundReason: donation.refundReason,
      refundDate: donation.refundDate
    });

    // Send admin notification
    await sendEmail(process.env.ADMIN_EMAIL, 'refundAdminNotification', {
      donorName: donation.name,
      donationId: donation.donationId,
      amount: donation.amount,
      refundReason: donation.refundReason
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        donationId: donation.donationId,
        refundAmount: donation.amount,
        refundDate: donation.refundDate
      }
    });

  } catch (error) {
    console.error('❌ Refund processing failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// @desc    Get donation by receipt number (Public)
// @route   GET /api/donations/receipt/:receiptNumber
// @access  Public
const getDonationByReceipt = async (req, res) => {
  try {
    const donation = await Donation.findOne({ 
      receiptNumber: req.params.receiptNumber 
    }).select('-paymentId -razorpayOrderId -razorpaySignature -ipAddress -userAgent');

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('❌ Get donation by receipt failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt'
    });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonation,
  updatePaymentStatus,
  emailReceipt,
  refundDonation,
  getDonationByReceipt
};