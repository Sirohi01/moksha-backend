const mongoose = require('mongoose');
const Admin = require('../models/Admin');
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
    
    // Security: If not an admin, ONLY show published content
    if (!req.admin) {
        query.status = 'published';
    } else if (status && status !== 'all') {
        query.status = status;
    } else if (status === 'all' && !req.admin) {
        // Fallback for public accessing 'all' - should still be only published
        query.status = 'published';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Content.countDocuments(query);
    const content = await Content.find(query)
      .populate('author', 'name role avatar')
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
    let contentItem;

    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      contentItem = await Content.findById(id).populate('author', 'name role avatar');
    } else {
      contentItem = await Content.findOne({ slug: id }).populate('author', 'name role avatar');
    }

    if (!contentItem) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    // Enforce published status for public access
    if (!req.admin && contentItem.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Content not published'
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
      featured = false,
      featuredImage,
      excerpt,
      category,
      youtubeUrl,
      reelUrl
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

    const mongoose = require('mongoose');
    const Admin = require('../models/Admin');
    let authorId = req.admin?._id;
    
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
        const fallbackAdmin = await Admin.findOne({ role: 'super_admin' });
        authorId = fallbackAdmin?._id;
    }

    const newContentItem = await Content.create({
      title,
      type,
      status,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || (typeof content === 'string' ? content.substring(0, 160) : ''),
      slug: finalSlug,
      author: authorId,
      views: 0,
      featured,
      excerpt,
      category,
      youtubeUrl,
      reelUrl
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
      featured,
      featuredImage,
      excerpt,
      category,
      youtubeUrl,
      reelUrl
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

    const mongoose = require('mongoose');
    const Admin = require('../models/Admin');
    let authorId = req.admin?._id;
    
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
        const fallbackAdmin = await Admin.findOne({ role: 'super_admin' });
        authorId = fallbackAdmin?._id;
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
    contentItem.author = authorId;
    contentItem.featuredImage = featuredImage || contentItem.featuredImage;
    contentItem.excerpt = excerpt || contentItem.excerpt;
    if (category !== undefined) contentItem.category = category;
    if (youtubeUrl !== undefined) contentItem.youtubeUrl = youtubeUrl;
    if (reelUrl !== undefined) contentItem.reelUrl = reelUrl;

    if (req.body.ogTitle !== undefined) contentItem.ogTitle = req.body.ogTitle;
    if (req.body.ogDescription !== undefined) contentItem.ogDescription = req.body.ogDescription;
    if (req.body.ogImage !== undefined) contentItem.ogImage = req.body.ogImage;
    if (req.body.twitterCard !== undefined) contentItem.twitterCard = req.body.twitterCard;
    if (req.body.twitterTitle !== undefined) contentItem.twitterTitle = req.body.twitterTitle;
    if (req.body.twitterDescription !== undefined) contentItem.twitterDescription = req.body.twitterDescription;
    if (req.body.twitterImage !== undefined) contentItem.twitterImage = req.body.twitterImage;
    if (req.body.schemaMarkup !== undefined) contentItem.schemaMarkup = req.body.schemaMarkup;
    if (req.body.canonicalUrl !== undefined) contentItem.canonicalUrl = req.body.canonicalUrl;
    if (req.body.robots !== undefined) contentItem.robots = req.body.robots;
    if (req.body.h1Tag !== undefined) contentItem.h1Tag = req.body.h1Tag;
    if (req.body.breadcrumb !== undefined) contentItem.breadcrumb = req.body.breadcrumb;

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

// @desc    Get all public slugs for sitemap
// @route   GET /api/content/public/slugs
// @access  Public
const getPublicSlugs = async (req, res) => {
  try {
    const content = await Content.find({ status: 'published' })
      .select('slug type updatedAt')
      .lean();

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('❌ Get public slugs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public slugs'
    });
  }
};

module.exports = {
  getContentItems,
  getContentItem,
  createContentItem,
  updateContentItem,
  deleteContentItem,
  getContentStats,
  getPublicSlugs
};