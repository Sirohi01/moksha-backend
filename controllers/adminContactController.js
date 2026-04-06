const Admin = require('../models/Admin');
const Volunteer = require('../models/Volunteer');
const Report = require('../models/Report');
const NewsletterSubscription = require('../models/NewsletterSubscription');
const { sendWhatsAppMessage, sendBatchWhatsApp } = require('../services/whatsappService');
const CommunicationLog = require('../models/CommunicationLog');
exports.getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = 'all', city = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = search ? new RegExp(search, 'i') : null;
    const cityFilter = city ? new RegExp(city, 'i') : null;

    let adminContacts = [];
    let volunteerContacts = [];
    let reporterContacts = [];
    let subscriberContacts = [];

    // Filter Logic Helpers
    const buildQuery = (fields) => {
      const query = { $or: [] };
      if (searchTerm) {
        fields.forEach(f => query.$or.push({ [f]: searchTerm }));
      }
      if (cityFilter) {
        // Only apply city filter to models that have city field
        if (query.$or.length > 0) {
          return { $and: [{ $or: query.$or }, { city: cityFilter }] };
        } else {
          return { city: cityFilter };
        }
      }
      return query.$or.length > 0 ? query : {};
    };

    // 1. Get Admins
    if (role === 'all' || role === 'admin' || role === 'super_admin') {
      const adminQuery = { isActive: true, ...buildQuery(['name', 'email', 'phone']) };
      if (role !== 'all') adminQuery.role = role;
      
      const admins = await Admin.find(adminQuery).select('name email phone role');
      adminContacts = admins.map(a => ({
        id: a._id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        role: a.role || 'admin',
        source: 'Admin'
      }));
    }

    // 2. Get Volunteers
    if (role === 'all' || role === 'volunteer') {
      const volunteerQuery = { ...buildQuery(['name', 'email', 'phone', 'city', 'state']) };
      const volunteers = await Volunteer.find(volunteerQuery).select('name email phone city state status volunteerTypes');
      volunteerContacts = volunteers.map(v => ({
        id: v._id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        city: v.city,
        state: v.state,
        status: v.status,
        role: (v.volunteerTypes && v.volunteerTypes[0]) || 'volunteer',
        source: 'Volunteer'
      }));
    }

    // 3. Get Reporters
    if (role === 'all' || role === 'reporter') {
      const reporterQuery = { ...buildQuery(['reporterName', 'reporterPhone', 'reporterEmail', 'city', 'state']) };
      const reports = await Report.find(reporterQuery).select('reporterName reporterPhone reporterEmail city state');
      const reporterMap = new Map();
      reports.forEach(r => {
        if (r.reporterPhone && !reporterMap.has(r.reporterPhone)) {
          reporterMap.set(r.reporterPhone, {
            id: r._id,
            name: r.reporterName || 'Unknown Reporter',
            email: r.reporterEmail,
            phone: r.reporterPhone,
            city: r.city,
            state: r.state,
            role: 'reporter',
            source: 'Report'
          });
        }
      });
      reporterContacts = Array.from(reporterMap.values());
    }

    // 4. Get Newsletter Subscribers
    if (role === 'all' || role === 'subscriber') {
      const subscriberQuery = {
        phone: { $exists: true, $ne: '' },
        ...buildQuery(['email', 'phone'])
      };
      const subscribers = await NewsletterSubscription.find(subscriberQuery).select('email phone status');
      subscriberContacts = subscribers.map(s => ({
        id: s._id,
        name: s.email.split('@')[0],
        email: s.email,
        phone: s.phone,
        status: s.status,
        role: 'subscriber',
        source: 'Newsletter'
      }));
    }

    // Combine all
    const allContactsCombined = [
      ...adminContacts,
      ...volunteerContacts,
      ...reporterContacts,
      ...subscriberContacts
    ];

    // Manual slice (since we merge across models)
    const paginatedContacts = allContactsCombined.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: paginatedContacts,
      total: allContactsCombined.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(allContactsCombined.length / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send WhatsApp message to specific contacts (Personalized)
 * @route   POST /api/admin/contacts/whatsapp
 * @access  Private (Admin)
 */
exports.sendWhatsAppToContacts = async (req, res) => {
  const { recipients, message, options } = req.body;
  console.log('WhatsApp Request Options:', options);

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide recipient details' });
  }

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  try {
    const results = [];
    const { sendWhatsAppMessage } = require('../services/whatsappService');
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    for (const recipient of recipients) {
      try {
        // Individualized message replace {name}
        let individualMsg = message;
        if (recipient.name) {
          individualMsg = message.replace(/{name}/g, recipient.name);
        }

        const res = await sendWhatsAppMessage(recipient.phone, individualMsg, options);
        results.push({ phone: recipient.phone, name: recipient.name, ...res });
        
        // 500ms security delay
        await delay(500);
      } catch (err) {
        results.push({ phone: recipient.phone, name: recipient.name, success: false, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Personalized transmission completed for ${recipients.length} recipients`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get WhatsApp interaction history for a specific contact
 * @route   GET /api/admin/contacts/whatsapp/history/:phone
 * @access  Private (Admin)
 */
exports.getContactHistory = async (req, res) => {
  try {
    const { phone } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const searchPhones = [cleanPhone];
    if (cleanPhone.length === 10) searchPhones.push('91' + cleanPhone);
    if (cleanPhone.startsWith('91')) searchPhones.push(cleanPhone.substring(2));

    const query = { 
      recipient: { $in: searchPhones },
      type: { $in: ['whatsapp', 'broadcast', 'alert'] }
    };

    const total = await CommunicationLog.countDocuments(query);
    const logs = await CommunicationLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get WhatsApp communication logs
 * @route   GET /api/admin/contacts/whatsapp/logs
 * @access  Private (Admin)
 */
exports.getWhatsAppLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, startDate, endDate, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { type: { $in: ['whatsapp', 'broadcast', 'alert'] } };

    if (search && search.trim()) {
      filter.content = new RegExp(search.trim(), 'i');
    }

    if ((startDate && startDate.trim()) || (endDate && endDate.trim())) {
      const dateFilter = {};
      if (startDate && startDate.trim()) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) dateFilter.$gte = start;
      }
      if (endDate && endDate.trim()) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setUTCHours(23, 59, 59, 999);
          dateFilter.$lte = end;
        }
      }
      if (Object.keys(dateFilter).length > 0) filter.createdAt = dateFilter;
    }

    const logs = await CommunicationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunicationLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
