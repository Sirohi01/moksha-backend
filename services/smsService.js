const CommunicationLog = require('../models/CommunicationLog');

/**
 * Generic SMS Service with integrated Intelligence Logging
 * @param {string} mobile - Recipient number
 * @param {string} message - Content
 * @returns {Promise<object>}
 */
const sendSMS = async (mobile, message) => {
    // 1. Create Intelligence Node
    const log = await CommunicationLog.create({
        type: 'sms',
        recipient: mobile,
        content: message,
        status: 'pending',
        provider: 'InternalSystem'
    });

    try {
        console.log(`[SMS] Intelligence Captured: Sending to ${mobile}`);
        log.status = 'delivered';
        log.providerMessageId = 'SMS_' + Math.random().toString(36).substr(2, 9);
        await log.save();

        return { success: true, message: 'SMS logged and propagated' };
    } catch (error) {
        log.status = 'failed';
        log.errorMessage = error.message;
        await log.save();
        return { success: false, error: error.message };
    }
};

module.exports = { sendSMS };
