const express = require('express');
const router = express.Router();
const {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
} = require('../controllers/emailTemplateController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('super_admin', 'manager'));

router.route('/')
    .get(getTemplates)
    .post(createTemplate);

router.route('/:id')
    .get(getTemplateById)
    .put(updateTemplate)
    .delete(deleteTemplate);

module.exports = router;
