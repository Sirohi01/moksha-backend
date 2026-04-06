const ComplianceDocument = require('../models/ComplianceDocument');
const DocumentLead = require('../models/DocumentLead');

const getDocuments = async (req, res) => {
  try {
    const documents = await ComplianceDocument.find({ status: { $ne: 'archived' } }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('❌ Get documents failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance documents'
    });
  }
};

const addDocument = async (req, res) => {
  try {
    const { title, description, fileUrl, fileSize, validityDate, documentType, order } = req.body;
    
    const document = await ComplianceDocument.create({
      title,
      description,
      fileUrl,
      fileSize,
      validityDate,
      documentType,
      order,
      uploadedBy: req.admin._id
    });

    res.status(201).json({
        success: true,
        message: 'Document added successfully',
        data: document
    });
  } catch (error) {
    console.error('❌ Add document failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add compliance document'
    });
  }
};

const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const document = await ComplianceDocument.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: document
        });
    } catch (error) {
        console.error('❌ Update document failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update compliance document'
        });
    }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await ComplianceDocument.findByIdAndDelete(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete document failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete compliance document'
    });
  }
};

// @desc    Register a new lead who accessed a document
// @route   POST /api/compliance/register
// @access  Public
const registerLead = async (req, res) => {
  try {
    const { documentId, name, email, phone, pincode } = req.body;
    
    // Get document details
    const doc = await ComplianceDocument.findById(documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const lead = await DocumentLead.create({
      documentId,
      documentTitle: doc.title,
      name,
      email,
      phone,
      pincode
    });

    res.status(201).json({
      success: true,
      message: 'Access granted',
      data: lead
    });
  } catch (error) {
    console.error('❌ Lead registration failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all document leads (for admin)
// @route   GET /api/compliance/leads
// @access  Private/Admin
const getLeads = async (req, res) => {
  try {
    const leads = await DocumentLead.find().sort({ accessedAt: -1 });
    res.status(200).json({
      success: true,
      data: leads
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leads' });
  }
};

module.exports = {
  getDocuments,
  addDocument,
  updateDocument,
  deleteDocument,
  registerLead,
  getLeads
};
