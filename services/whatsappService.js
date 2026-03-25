const axios = require('axios');

/**
 * Send WhatsApp message using Opus Technology API
 * @param {string} mobile - Mobile number with country code (e.g., 91xxxxxxxxxx)
 * @param {string} msg - The message to send
 * @returns {Promise<object>} - API response
 */
const sendWhatsAppMessage = async (mobile, msg) => {
  try {
    const apiKey = process.env.OPUS_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OPUS_API_KEY is missing in environment variables');
      return { success: false, message: 'WhatsApp API Key missing' };
    }

    // Ensure mobile has no '+' prefix
    const cleanMobile = mobile.replace('+', '');
    
    const url = `http://api.opustechnology.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${cleanMobile}&msg=${encodeURIComponent(msg)}`;

    const response = await axios.get(url);
    
    if (response.data && (response.data.status === 'success' || response.data.code === 200)) {
      console.log(`✅ WhatsApp sent to ${cleanMobile}`);
      return { success: true, data: response.data };
    } else {
      console.error(`❌ WhatsApp failed for ${cleanMobile}:`, response.data);
      return { success: false, message: response.data.message || 'WhatsApp API Error' };
    }
  } catch (error) {
    console.error(`❌ WhatsApp exception for ${mobile}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send OTP via WhatsApp
 * @param {string} mobile - Mobile number
 * @param {string} otp - 6-digit OTP
 */
const sendWhatsAppOTP = async (mobile, otp) => {
  const msg = `MOKSHA SEWA FOUNDATION - Verification Code: ${otp}. This code is valid for 10 minutes. Please do not share this OTP with anyone.`;
  return await sendWhatsAppMessage(mobile, msg);
};

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppOTP
};
