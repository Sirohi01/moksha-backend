const Content = require('../models/Content');

// @desc    Get all content items
// @route   GET /api/content
// @access  Private
const getContentItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    
    // Build query
    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        content,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get content items failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content items'
    });
  }
};

// @desc    Get single content item
// @route   GET /api/content/:id
// @access  Private
const getContentItem = async (req, res) => {
  try {
    const { id } = req.params;
    const contentItem = await Content.findById(id);
    
    if (!contentItem) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: contentItem
    });
  } catch (error) {
    console.error('❌ Get content item failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content item'
    });
  }
};

// @desc    Create new content item
// @route   POST /api/content
// @access  Private
const createContentItem = async (req, res) => {
  try {
    const {
      title,
      type,
      content,
      metaTitle,
      metaDescription,
      slug,
      status = 'draft',
      featured = false
    } = req.body;

    // Generate slug if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists
    const existingItem = await Content.findOne({ slug: finalSlug });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Content with this slug already exists'
      });
    }

    const newContentItem = await Content.create({
      title,
      type,
      status,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || (typeof content === 'string' ? content.substring(0, 160) : ''),
      slug: finalSlug,
      author: req.admin.name,
      views: 0,
      featured
    });

    res.status(201).json({
      success: true,
      message: 'Content item created successfully',
      data: newContentItem
    });
  } catch (error) {
    console.error('❌ Create content item failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create content item'
    });
  }
};

// @desc    Update content item
// @route   PUT /api/content/:id
// @access  Private
const updateContentItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      content,
      metaTitle,
      metaDescription,
      slug,
      status,
      featured
    } = req.body;

    const contentItem = await Content.findById(id);
    if (!contentItem) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    // Check if new slug conflicts
    if (slug && slug !== contentItem.slug) {
      const existingItem = await Content.findOne({ slug, _id: { $ne: id } });
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Content with this slug already exists'
        });
      }
    }

    // Update fields
    contentItem.title = title || contentItem.title;
    contentItem.type = type || contentItem.type;
    contentItem.content = content || contentItem.content;
    contentItem.metaTitle = metaTitle || contentItem.metaTitle;
    contentItem.metaDescription = metaDescription || contentItem.metaDescription;
    contentItem.slug = slug || contentItem.slug;
    contentItem.status = status || contentItem.status;
    contentItem.featured = featured !== undefined ? featured : contentItem.featured;
    contentItem.author = req.admin.name;

    await contentItem.save();

    res.status(200).json({
      success: true,
      message: 'Content item updated successfully',
      data: contentItem
    });
  } catch (error) {
    console.error('❌ Update content item failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update content item'
    });
  }
};

// @desc    Delete content item
// @route   DELETE /api/content/:id
// @access  Private
const deleteContentItem = async (req, res) => {
  try {
    const { id } = req.params;
    const contentItem = await Content.findByIdAndDelete(id);
    
    if (!contentItem) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Content item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete content item failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete content item'
    });
  }
};

// @desc    Get content statistics
// @route   GET /api/content/stats
// @access  Private
const getContentStats = async (req, res) => {
  try {
    const totalContent = await Content.countDocuments();
    const published = await Content.countDocuments({ status: 'published' });
    const draft = await Content.countDocuments({ status: 'draft' });
    const archived = await Content.countDocuments({ status: 'archived' });
    
    const types = ['page', 'blog', 'campaign', 'press'];
    const byType = {};
    for (const type of types) {
      byType[type] = await Content.countDocuments({ type });
    }

    const viewsResult = await Content.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    
    const recentContent = await Content.find()
      .sort({ updatedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalContent,
        published,
        draft,
        archived,
        byType,
        totalViews: viewsResult.length > 0 ? viewsResult[0].totalViews : 0,
        recentContent
      }
    });
  } catch (error) {
    console.error('❌ Get content stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch content statistics'
    });
  }
};

module.exports = {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentStats
};