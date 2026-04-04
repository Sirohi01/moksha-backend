const SOP = require('../models/SOP');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

// @desc    Get all SOPs
// @route   GET /api/sops
// @access  Public/Private
const getSOPs = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (category) query.category = category;
    
    // Security: If not admin, only show published
    if (!req.admin) {
      query.status = 'published';
    } else if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await SOP.countDocuments(query);
    const sops = await SOP.find(query)
      .populate('author', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: sops.length,
      total,
      data: sops
    });
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single SOP
// @route   GET /api/sops/:id (or :slug)
// @access  Public/Private
const getSOP = async (req, res) => {
  try {
    const { id } = req.params;
    let sop;

    if (mongoose.Types.ObjectId.isValid(id)) {
      sop = await SOP.findById(id).populate('author', 'name role');
    } else {
      sop = await SOP.findOne({ slug: id }).populate('author', 'name role');
    }

    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    // Increment views if public
    if (!req.admin) {
      sop.views += 1;
      await sop.save();
    }

    res.status(200).json({ success: true, data: sop });
  } catch (error) {
    console.error('Error fetching SOP:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create SOP
// @route   POST /api/sops
// @access  Private
const createSOP = async (req, res) => {
  try {
    const { title, content, category, description, status, isCritical } = req.body;
    
    // Get author
    let authorId = req.admin?._id;
    if (!authorId) {
      const fallback = await Admin.findOne({ role: 'super_admin' });
      authorId = fallback?._id;
    }

    const sop = await SOP.create({
      title,
      content,
      category,
      description,
      status,
      isCritical,
      author: authorId
    });

    res.status(201).json({ success: true, data: sop });
  } catch (error) {
    console.error('Error creating SOP:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Update SOP
// @route   PUT /api/sops/:id
// @access  Private
const updateSOP = async (req, res) => {
  try {
    const { title, content, category, description, status, isCritical } = req.body;
    const sop = await SOP.findById(req.params.id);

    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }

    sop.title = title || sop.title;
    sop.content = content || sop.content;
    sop.category = category || sop.category;
    sop.description = description || sop.description;
    sop.status = status || sop.status;
    sop.isCritical = isCritical !== undefined ? isCritical : sop.isCritical;
    sop.lastEditedBy = req.admin?._id;
    sop.version += 1;

    await sop.save();
    res.status(200).json({ success: true, data: sop });
  } catch (error) {
    console.error('Error updating SOP:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete SOP
// @route   DELETE /api/sops/:id
// @access  Private
const deleteSOP = async (req, res) => {
  try {
    const sop = await SOP.findByIdAndDelete(req.params.id);
    if (!sop) {
      return res.status(404).json({ success: false, message: 'SOP not found' });
    }
    res.status(200).json({ success: true, message: 'SOP deleted' });
  } catch (error) {
    console.error('Error deleting SOP:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getSOPs,
  getSOP,
  createSOP,
  updateSOP,
  deleteSOP
};
