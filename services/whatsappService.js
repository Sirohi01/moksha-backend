const axios = require('axios');
const CommunicationLog = require('../models/CommunicationLog');

/**
 * Send individual WhatsApp message using Opus API
 */
const sendWhatsAppMessage = async (mobile, msg, options = {}) => {
  const { type = 'whatsapp' } = options;

  const log = await CommunicationLog.create({
    type,
    recipient: mobile,
    content: msg,
    status: 'pending',
    provider: 'WhatsAppCloudAPI',
    metadata: { ...options }
  });

  try {
    const apiKey = process.env.OPUS_API_KEY?.trim();

    if (!apiKey) {
      log.status = 'failed';
      log.errorMessage = 'API Key missing';
      await log.save();
      return { success: false, message: 'WhatsApp API Key missing' };
    }

    // Clean mobile number (handle URL encoding like %2B for +)
    let cleanMobile = decodeURIComponent(mobile).replace(/[^0-9]/g, '');
    if (cleanMobile.length === 10) cleanMobile = '91' + cleanMobile;

    // Opus API URL (Try both msg and text parameters for compatibility)
    const url = `http://api.opustechnology.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${cleanMobile}&msg=${encodeURIComponent(msg)}&text=${encodeURIComponent(msg)}`;
    
    console.log('Final WhatsApp Transmission URL:', url);

    const response = await axios.get(url);

    if (response.data && (response.data.status === 'success' || response.data.code === 200)) {
      log.status = 'delivered';
      log.providerMessageId = response.data.id || response.data.message_id || 'sent_via_api';
      await log.save();
      return { success: true, data: response.data };
    } else {
      log.status = 'failed';
      log.errorMessage = response.data.message || 'WhatsApp API Error';
      await log.save();
      return { success: false, message: response.data.message || 'WhatsApp API Error' };
    }
  } catch (error) {
    log.status = 'failed';
    log.errorMessage = error.message;
    await log.save();
    return { success: false, error: error.message };
  }
};

/**
 * Send verification OTP
 */
const sendWhatsAppOTP = async (mobile, otp) => {
  const msg = `MOKSHA SEWA FOUNDATION - Verification Code: ${otp}. This code is valid for 10 minutes. Please do not share this OTP with anyone.`;
  return await sendWhatsAppMessage(mobile, msg);
};

/**
 * Batch processing for broadcasts
 */
const sendBatchWhatsApp = async (recipients, msg, options = {}) => {
  const results = [];
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  for (const mobile of recipients) {
    try {
      const res = await sendWhatsAppMessage(mobile, msg, options);
      results.push({ mobile, ...res });
      await delay(500); // Protection delay
    } catch (err) {
      results.push({ mobile, success: false, error: err.message });
    }
  }
  return results;
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppOTP,
  sendBatchWhatsApp
};
