const SystemSettings = require('../models/SystemSettings');
const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        const rawSettings = settings.toObject();
        const safeSettings = {
            general: {
                siteName: rawSettings.general?.siteName || process.env.SITE_NAME || 'Moksha Sewa',
                siteUrl: rawSettings.general?.siteUrl || process.env.SITE_URL || 'https://mokshasewa.org',
                adminEmail: rawSettings.general?.adminEmail || process.env.ADMIN_EMAIL || 'admin@mokshasewa.org',
                timezone: rawSettings.general?.timezone || 'Asia/Kolkata',
                language: rawSettings.general?.language || 'en',
                maintenanceMode: rawSettings.general?.maintenanceMode || false
            },
            security: {
                sessionTimeout: rawSettings.security?.sessionTimeout || 24,
                maxLoginAttempts: rawSettings.security?.maxLoginAttempts || 5,
                passwordMinLength: rawSettings.security?.passwordMinLength || 8,
                requireTwoFactor: rawSettings.security?.requireTwoFactor || false,
                ipWhitelisting: rawSettings.security?.ipWhitelisting || false,
                allowedIPs: rawSettings.security?.allowedIPs || []
            },
            email: {
                smtpHost: rawSettings.email?.smtpHost || process.env.SMTP_HOST || '',
                smtpPort: rawSettings.email?.smtpPort || parseInt(process.env.SMTP_PORT) || 587,
                smtpUser: rawSettings.email?.smtpUser || process.env.SMTP_USER || '',
                smtpPassword: rawSettings.email?.smtpPassword || process.env.SMTP_PASS || '',
                fromEmail: rawSettings.email?.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER || '',
                fromName: rawSettings.email?.fromName || process.env.FROM_NAME || 'Moksha Sewa'
            },
            razorpay: {
                keyId: rawSettings.razorpay?.keyId || process.env.RAZORPAY_KEY_ID || '',
                keySecret: rawSettings.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET || '',
                webhookSecret: rawSettings.razorpay?.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET || '',
                enableTestMode: rawSettings.razorpay?.enableTestMode !== undefined ? rawSettings.razorpay.enableTestMode : (process.env.RAZORPAY_TEST_MODE !== 'false')
            },
            features: rawSettings.features || {
                enableDonations: true,
                enableVolunteers: true,
                enableGallery: true,
                enablePress: true,
                enableAnalytics: true
            },
            institutional: rawSettings.institutional || {},
            updatedBy: rawSettings.updatedBy,
            lastUpdated: rawSettings.lastUpdated,
            _id: rawSettings._id
        };

        if (safeSettings.email.smtpPassword) safeSettings.email.smtpPassword = '***hidden***';
        if (safeSettings.razorpay.keySecret) safeSettings.razorpay.keySecret = '***hidden***';
        if (safeSettings.razorpay.webhookSecret) safeSettings.razorpay.webhookSecret = '***hidden***';

        res.status(200).json({
            success: true,
            data: safeSettings
        });
    } catch (error) {
        console.error('❌ Get settings failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system settings'
        });
    }
};

const getPublicSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.findOne();
        if (!settings) {
            return res.status(200).json({
                success: true,
                data: {
                    general: { siteName: 'Moksha Sewa' },
                    institutional: { organizationName: 'Moksha Sewa Foundation' }
                }
            });
        }

        const data = {
            general: {
                siteName: settings.general?.siteName,
                siteUrl: settings.general?.siteUrl,
            },
            institutional: settings.institutional || {}
        };

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch public settings'
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const updateData = req.body;
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({});
        }
        const sections = ['general', 'security', 'email', 'razorpay', 'features', 'institutional'];
        sections.forEach(section => {
            if (updateData[section]) {
                const updatedSection = { ...settings[section].toObject ? settings[section].toObject() : settings[section], ...updateData[section] };
                if (section === 'email' && updatedSection.smtpPassword === '***hidden***') {
                    delete updatedSection.smtpPassword;
                }
                if (section === 'razorpay') {
                    if (updatedSection.keySecret === '***hidden***') delete updatedSection.keySecret;
                    if (updatedSection.webhookSecret === '***hidden***') delete updatedSection.webhookSecret;
                }

                settings[section] = updatedSection;
            }
        });

        settings.updatedBy = req.admin ? req.admin.name : 'Unknown Admin';
        settings.lastUpdated = new Date();
        await settings.save();

        // Return safe settings
        const safeSettings = settings.toObject();
        if (safeSettings.email.smtpPassword) safeSettings.email.smtpPassword = '***hidden***';
        if (safeSettings.razorpay.keySecret) safeSettings.razorpay.keySecret = '***hidden***';
        if (safeSettings.razorpay.webhookSecret) safeSettings.razorpay.webhookSecret = '***hidden***';

        res.status(200).json({
            success: true,
            message: 'System settings updated successfully',
            data: safeSettings
        });
    } catch (error) {
        console.error('❌ Update settings failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update system settings'
        });
    }
};
const getSettingsSection = async (req, res) => {
    try {
        const { section } = req.params;
        const settings = await SystemSettings.findOne();
        if (!settings || !settings[section]) {
            return res.status(404).json({ success: false, message: 'Section not found' });
        }

        const sectionData = settings[section].toObject ? settings[section].toObject() : settings[section];
        if (section === 'email' && sectionData.smtpPassword) sectionData.smtpPassword = '***hidden***';
        if (section === 'razorpay') {
            if (sectionData.keySecret) sectionData.keySecret = '***hidden***';
            if (sectionData.webhookSecret) sectionData.webhookSecret = '***hidden***';
        }

        res.status(200).json({ success: true, data: sectionData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch section' });
    }
};
const updateSettingsSection = async (req, res) => {
    try {
        const { section } = req.params;
        const updateData = req.body;
        let settings = await SystemSettings.findOne();
        if (!settings) settings = new SystemSettings({});

        const sectionData = { ...settings[section].toObject(), ...updateData };
        if (section === 'email' && sectionData.smtpPassword === '***hidden***') delete sectionData.smtpPassword;
        if (section === 'razorpay') {
            if (sectionData.keySecret === '***hidden***') delete sectionData.keySecret;
            if (sectionData.webhookSecret === '***hidden***') delete sectionData.webhookSecret;
        }

        settings[section] = sectionData;
        settings.lastUpdated = new Date();
        settings.updatedBy = req.admin ? req.admin.name : 'Unknown';
        await settings.save();

        res.status(200).json({ success: true, message: `${section} updated successfully` });
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ success: false, message: 'Failed to update section' });
    }
};
const resetSettings = async (req, res) => {
    try {
        await SystemSettings.deleteOne({});
        const defaults = await SystemSettings.create({});
        res.status(200).json({ success: true, message: 'All settings reset to defaults', data: defaults });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Reset failed' });
    }
};
const backupSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.findOne();
        res.status(200).json({ success: true, data: settings, backupDate: new Date() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Backup failed' });
    }
};
const testEmailConfig = async (req, res) => {
    res.status(200).json({ success: true, message: 'Test email logic ready' });
};

module.exports = {
    getSettings,
    updateSettings,
    getPublicSettings,
    getSettingsSection,
    updateSettingsSection,
    resetSettings,
    backupSettings,
    testEmailConfig
};