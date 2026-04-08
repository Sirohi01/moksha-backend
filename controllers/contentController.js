const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Content = require('../models/Content');
const notificationService = require('../services/notificationService');

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
      // ... same fields as before ...
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
      featuredImage,
      gallery: req.body.gallery || [],
      sections: req.body.sections || [],
      excerpt,
      category,
      youtubeUrl,
      reelUrl,
      tags: req.body.tags || [],
      customFields: req.body.customFields || {},
      seoTechnical: {
        ogTitle: req.body.ogTitle || req.body.seoTechnical?.ogTitle,
        ogDescription: req.body.ogDescription || req.body.seoTechnical?.ogDescription,
        ogImage: req.body.ogImage || req.body.seoTechnical?.ogImage,
        twitterCard: req.body.twitterCard || req.body.seoTechnical?.twitterCard || 'summary_large_image',
        schemaMarkup: req.body.schemaMarkup || req.body.seoTechnical?.schemaMarkup,
        canonicalUrl: req.body.canonicalUrl || req.body.seoTechnical?.canonicalUrl,
        robots: req.body.robots || req.body.seoTechnical?.robots || 'index, follow',
        h1Tag: req.body.h1Tag || req.body.seoTechnical?.h1Tag,
        breadcrumb: req.body.breadcrumb || req.body.seoTechnical?.breadcrumb,
        redirectionUrl: req.body.redirectionUrl || req.body.seoTechnical?.redirectionUrl
      },
      seoRanking: req.body.seoRanking || {}
    });

    // 🚀 NEW: Notification for Super Admins
    const adminName = req.admin ? req.admin.name : 'System';
    await notificationService.createAndNotify({
      title: 'New Content Created ✍️',
      message: `${adminName} created a new ${type}: "${title.substring(0, 30)}..."`,
      type: 'activity',
      priority: 'medium',
      link: `/admin/${type === 'press' ? 'press' : type + 's'}/edit/${newContentItem._id}`,
      sourceId: newContentItem._id.toString()
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
    contentItem.gallery = req.body.gallery || contentItem.gallery;
    contentItem.sections = req.body.sections || contentItem.sections;
    contentItem.tags = req.body.tags || contentItem.tags;
    contentItem.customFields = req.body.customFields || contentItem.customFields;

    if (category !== undefined) contentItem.category = category;
    if (youtubeUrl !== undefined) contentItem.youtubeUrl = youtubeUrl;
    if (reelUrl !== undefined) contentItem.reelUrl = reelUrl;

    // SEO Technical updates
    if (!contentItem.seoTechnical) contentItem.seoTechnical = {};
    if (req.body.ogTitle !== undefined) contentItem.seoTechnical.ogTitle = req.body.ogTitle;
    if (req.body.ogDescription !== undefined) contentItem.seoTechnical.ogDescription = req.body.ogDescription;
    if (req.body.ogImage !== undefined) contentItem.seoTechnical.ogImage = req.body.ogImage;
    if (req.body.twitterCard !== undefined) contentItem.seoTechnical.twitterCard = req.body.twitterCard;
    if (req.body.schemaMarkup !== undefined) contentItem.seoTechnical.schemaMarkup = req.body.schemaMarkup;
    if (req.body.canonicalUrl !== undefined) contentItem.seoTechnical.canonicalUrl = req.body.canonicalUrl;
    if (req.body.robots !== undefined) contentItem.seoTechnical.robots = req.body.robots;
    if (req.body.h1Tag !== undefined) contentItem.seoTechnical.h1Tag = req.body.h1Tag;
    if (req.body.breadcrumb !== undefined) contentItem.seoTechnical.breadcrumb = req.body.breadcrumb;
    if (req.body.redirectionUrl !== undefined) contentItem.seoTechnical.redirectionUrl = req.body.redirectionUrl;

    // SEO Ranking updates
    if (req.body.seoRanking !== undefined) {
      contentItem.seoRanking = { ...contentItem.seoRanking, ...req.body.seoRanking };
    }

    await contentItem.save();

    // 🚀 NEW: Notification for Super Admins
    const adminName = req.admin ? req.admin.name : 'System';
    await notificationService.createAndNotify({
      title: 'Content Updated 📝',
      message: `${adminName} updated ${contentItem.type}: "${contentItem.title.substring(0, 30)}..."`,
      type: 'activity',
      priority: 'low',
      link: `/admin/${contentItem.type === 'press' ? 'press' : contentItem.type + 's'}/edit/${contentItem._id}`,
      sourceId: contentItem._id.toString()
    });

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

    // 🚀 NEW: Notification for Super Admins
    const adminName = req.admin ? req.admin.name : 'System';
    await notificationService.createAndNotify({
      title: 'Content Deleted 🗑️',
      message: `${adminName} deleted ${contentItem.type}: "${contentItem.title.substring(0, 30)}..."`,
      type: 'security',
      priority: 'high',
      sourceId: id
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
    const { type } = req.query;
    const baseQuery = {};
    if (type && type !== 'all') baseQuery.type = type;

    const totalContent = await Content.countDocuments(baseQuery);
    const published = await Content.countDocuments({ ...baseQuery, status: 'published' });
    const draft = await Content.countDocuments({ ...baseQuery, status: 'draft' });
    const archived = await Content.countDocuments({ ...baseQuery, status: 'archived' });

    const types = ['page', 'blog', 'campaign', 'press'];
    const byType = {};
    for (const type of types) {
      byType[type] = await Content.countDocuments({ type });
    }

    const viewsResult = await Content.aggregate([
      { $match: baseQuery },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const recentContent = await Content.find(baseQuery)
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