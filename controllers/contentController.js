// In-memory content storage (replace with database in production)
let contentItems = [
  {
    id: '1',
    title: 'About Moksha Seva - Our Mission',
    type: 'page',
    status: 'published',
    content: 'Moksha Seva is dedicated to providing dignified cremation services...',
    metaTitle: 'About Moksha Seva - Our Mission and Values',
    metaDescription: 'Learn about Moksha Seva\'s mission to provide dignified cremation services for unclaimed bodies and underprivileged families across India.',
    slug: 'about-moksha-seva',
    lastModified: new Date('2024-01-15'),
    author: 'SEO Team',
    views: 1250,
    featured: true
  },
  {
    id: '2',
    title: 'How to Report Unclaimed Bodies',
    type: 'blog',
    status: 'published',
    content: 'If you encounter an unclaimed body, here\'s what you should do...',
    metaTitle: 'How to Report Unclaimed Bodies - Step by Step Guide',
    metaDescription: 'Complete guide on how to report unclaimed bodies to authorities and Moksha Seva for dignified cremation services.',
    slug: 'how-to-report-unclaimed-bodies',
    lastModified: new Date('2024-01-10'),
    author: 'Content Team',
    views: 890,
    featured: false
  },
  {
    id: '3',
    title: 'Dignity for All Campaign',
    type: 'campaign',
    status: 'published',
    content: 'Our flagship campaign ensuring every person receives dignified final rites...',
    metaTitle: 'Dignity for All - Moksha Seva Campaign',
    metaDescription: 'Join our Dignity for All campaign to ensure every person receives respectful and dignified final rites regardless of their background.',
    slug: 'dignity-for-all-campaign',
    lastModified: new Date('2024-01-08'),
    author: 'Marketing Team',
    views: 2100,
    featured: true
  }
];

// @desc    Get all content items
// @route   GET /api/content
// @access  Private
const getContentItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    
    let filteredContent = [...contentItems];
    
    // Filter by type
    if (type && type !== 'all') {
      filteredContent = filteredContent.filter(item => item.type === type);
    }
    
    // Filter by status
    if (status && status !== 'all') {
      filteredContent = filteredContent.filter(item => item.status === status);
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredContent = filteredContent.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.author.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by last modified (newest first)
    filteredContent.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedContent = filteredContent.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      data: {
        content: paginatedContent,
        total: filteredContent.length,
        page: parseInt(page),
        pages: Math.ceil(filteredContent.length / limit)
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
    
    const contentItem = contentItems.find(item => item.id === id);
    
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
    const existingItem = contentItems.find(item => item.slug === finalSlug);
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Content with this slug already exists'
      });
    }

    const newContentItem = {
      id: Date.now().toString(),
      title,
      type,
      status,
      content,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || content.substring(0, 160),
      slug: finalSlug,
      lastModified: new Date(),
      author: req.admin.name,
      views: 0,
      featured
    };

    contentItems.unshift(newContentItem);

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

    const itemIndex = contentItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    // Check if new slug conflicts with existing items
    if (slug && slug !== contentItems[itemIndex].slug) {
      const existingItem = contentItems.find(item => item.slug === slug && item.id !== id);
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: 'Content with this slug already exists'
        });
      }
    }

    // Update content item
    contentItems[itemIndex] = {
      ...contentItems[itemIndex],
      title: title || contentItems[itemIndex].title,
      type: type || contentItems[itemIndex].type,
      content: content || contentItems[itemIndex].content,
      metaTitle: metaTitle || contentItems[itemIndex].metaTitle,
      metaDescription: metaDescription || contentItems[itemIndex].metaDescription,
      slug: slug || contentItems[itemIndex].slug,
      status: status || contentItems[itemIndex].status,
      featured: featured !== undefined ? featured : contentItems[itemIndex].featured,
      lastModified: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Content item updated successfully',
      data: contentItems[itemIndex]
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

    const itemIndex = contentItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Content item not found'
      });
    }

    // Remove from array
    contentItems.splice(itemIndex, 1);

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
    const stats = {
      totalContent: contentItems.length,
      published: contentItems.filter(item => item.status === 'published').length,
      draft: contentItems.filter(item => item.status === 'draft').length,
      archived: contentItems.filter(item => item.status === 'archived').length,
      byType: {
        page: contentItems.filter(item => item.type === 'page').length,
        blog: contentItems.filter(item => item.type === 'blog').length,
        campaign: contentItems.filter(item => item.type === 'campaign').length,
        press: contentItems.filter(item => item.type === 'press').length
      },
      totalViews: contentItems.reduce((sum, item) => sum + item.views, 0),
      recentContent: contentItems
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
        .slice(0, 5)
    };

    res.status(200).json({
      success: true,
      data: stats
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