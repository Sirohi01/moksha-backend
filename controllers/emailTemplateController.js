const EmailTemplate = require('../models/EmailTemplate');

const getTemplates = async (req, res) => {
    try {
        const templates = await EmailTemplate.find().sort({ category: 1, name: 1 });
        res.status(200).json({
            success: true,
            count: templates.length,
            data: templates
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error', message: error.message });
    }
};

const getTemplateById = async (req, res) => {
    try {
        const template = await EmailTemplate.findById(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.create(req.body);
        res.status(201).json({ success: true, data: template });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Template name already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const template = await EmailTemplate.findByIdAndDelete(req.params.id);
        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }
        res.status(200).json({ success: true, message: 'Template removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
};
