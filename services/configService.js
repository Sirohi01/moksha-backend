const SystemSettings = require('../models/SystemSettings');
const getConfig = async () => {
    try {
        const dbSettings = await SystemSettings.findOne();
        if (!dbSettings) {
            return {
                email: {
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                    fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER,
                    fromName: process.env.FROM_NAME || 'Moksha Sewa'
                },
                razorpay: {
                    keyId: process.env.RAZORPAY_KEY_ID,
                    keySecret: process.env.RAZORPAY_KEY_SECRET,
                    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
                    enableTestMode: process.env.RAZORPAY_TEST_MODE !== 'false'
                }
            };
        }

        const settings = dbSettings.toObject();

        return {
            email: {
                host: settings.email.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
                port: settings.email.smtpPort || parseInt(process.env.SMTP_PORT) || 587,
                user: settings.email.smtpUser || process.env.SMTP_USER,
                pass: settings.email.smtpPassword || process.env.SMTP_PASS,
                fromEmail: settings.email.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER,
                fromName: settings.email.fromName || process.env.FROM_NAME || 'Moksha Sewa'
            },
            razorpay: {
                keyId: settings.razorpay.keyId || process.env.RAZORPAY_KEY_ID,
                keySecret: settings.razorpay.keySecret || process.env.RAZORPAY_KEY_SECRET,
                webhookSecret: settings.razorpay.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET,
                enableTestMode: settings.razorpay.enableTestMode !== undefined ? settings.razorpay.enableTestMode : process.env.RAZORPAY_TEST_MODE !== 'false'
            },
            institutional: settings.institutional || {}
        };
    } catch (error) {
        console.error('Error fetching config from DB, using ENV fallback:', error);
        return {
            email: {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT) || 587,
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
                fromEmail: process.env.FROM_EMAIL || process.env.SMTP_USER,
                fromName: process.env.FROM_NAME || 'Moksha Sewa'
            },
            razorpay: {
                keyId: process.env.RAZORPAY_KEY_ID,
                keySecret: process.env.RAZORPAY_KEY_SECRET,
                webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
                enableTestMode: process.env.RAZORPAY_TEST_MODE !== 'false'
            }
        };
    }
};

module.exports = { getConfig };
