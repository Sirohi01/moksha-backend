const express = require('express');
const router = express.Router();
const { 
    getDocuments, 
    addDocument, 
    updateDocument, 
    deleteDocument 
} = require('../controllers/complianceController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/documents', getDocuments);

// Admin only routes
router.post('/documents', protect, authorize('admin', 'super_admin'), addDocument);
router.put('/documents/:id', protect, authorize('admin', 'super_admin'), updateDocument);
router.delete('/documents/:id', protect, authorize('admin', 'super_admin'), deleteDocument);

module.exports = router;
