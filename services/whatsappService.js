const axios = require('axios');
const CommunicationLog = require('../models/CommunicationLog');
const sendWhatsAppMessage = async (mobile, msg) => {
  const log = await CommunicationLog.create({
    type: 'whatsapp',
    recipient: mobile,
    content: msg,
    status: 'pending',
    provider: 'WhatsAppCloudAPI'
  });

  try {
    const apiKey = process.env.OPUS_API_KEY;

    if (!apiKey) {
      console.warn('⚠️ OPUS_API_KEY is missing in environment variables');
      log.status = 'failed';
      log.errorMessage = 'API Key missing';
      await log.save();
      return { success: false, message: 'WhatsApp API Key missing' };
    }

    // Ensure mobile has no '+' prefix
    const cleanMobile = mobile.replace('+', '');

    const url = `http://api.opustechnology.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${cleanMobile}&msg=${encodeURIComponent(msg)}`;

    const response = await axios.get(url);

    if (response.data && (response.data.status === 'success' || response.data.code === 200)) {
      console.log(`✅ WhatsApp sent to ${cleanMobile}`);
      log.status = 'delivered';
      log.providerMessageId = response.data.id || response.data.message_id;
      await log.save();
      return { success: true, data: response.data };
    } else {
      console.error(`❌ WhatsApp failed for ${cleanMobile}:`, response.data);
      log.status = 'failed';
      log.errorMessage = response.data.message || 'WhatsApp API Error';
      await log.save();
      return { success: false, message: response.data.message || 'WhatsApp API Error' };
    }
  } catch (error) {
    console.error(`❌ WhatsApp exception for ${mobile}:`, error.message);
    log.status = 'failed';
    log.errorMessage = error.message;
    await log.save();
    return { success: false, error: error.message };
  }
};
const sendWhatsAppOTP = async (mobile, otp) => {
  const msg = `MOKSHA SEWA FOUNDATION - Verification Code: ${otp}. This code is valid for 10 minutes. Please do not share this OTP with anyone.`;
  return await sendWhatsAppMessage(mobile, msg);
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppOTP
};
