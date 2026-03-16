const SEOPage = require('../models/SEOPage');
const Content = require('../models/Content');
const Analytics = require('../models/Analytics');
const SEOService = require('../services/seoService');
const SitemapService = require('../services/sitemapService');

// @desc    Get all SEO pages
// @route   GET /api/seo
// @access  Private/SEO Team
const getSEOData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { metaTitle: new RegExp(req.query.search, 'i') },
        { url: new RegExp(req.query.search, 'i') }
      ];
    }

    const seoPages = await SEOPage.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SEOPage.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: seoPages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Get SEO pages failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO pages'
    });
  }
};

// @desc    Get single SEO page by page name
// @route   GET /api/seo/page/:pageName
// @access  Private/SEO Team
const getSEOPageByName = async (req, res) => {
  try {
    const { pageName } = req.params;
    
    // Try to find SEO page by page name or URL
    const seoPage = await SEOPage.findOne({
      $or: [
        { pageName: pageName },
        { url: `/${pageName}` },
        { url: pageName }
      ]
    });

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: `SEO data for page '${pageName}' not found`
      });
    }

    res.status(200).json({
      success: true,
      data: seoPage
    });

  } catch (error) {
    console.error('❌ Get SEO page by name failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO page'
    });
  }
};

// @desc    Update SEO page by page name
// @route   PUT /api/seo/page/:pageName
// @access  Private/SEO Team
const updateSEOPageByName = async (req, res) => {
  try {
    const { pageName } = req.params;
    
    // Try to find existing SEO page
    let seoPage = await SEOPage.findOne({
      $or: [
        { pageName: pageName },
        { url: `/${pageName}` },
        { url: pageName }
      ]
    });

    if (seoPage) {
      // Update existing page
      Object.assign(seoPage, {
        ...req.body,
        lastOptimized: new Date()
      });
    } else {
      // Create new SEO page
      seoPage = new SEOPage({
        ...req.body,
        pageName: pageName,
        url: `/${pageName}`,
        assignedTo: req.admin?.id,
        lastOptimized: new Date()
      });
    }

    // Calculate SEO score
    if (seoPage.calculateSEOScore) {
      seoPage.calculateSEOScore();
    }
    
    await seoPage.save();

    res.status(200).json({
      success: true,
      message: `SEO page for '${pageName}' ${seoPage.isNew ? 'created' : 'updated'} successfully`,
      data: seoPage
    });

  } catch (error) {
    console.error('❌ Update SEO page by name failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SEO page'
    });
  }
};
const getSEOPage = async (req, res) => {
  try {
    const seoPage = await SEOPage.findById(req.params.id);

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: 'SEO page not found'
      });
    }

    res.status(200).json({
      success: true,
      data: seoPage
    });

  } catch (error) {
    console.error('❌ Get SEO page failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO page'
    });
  }
};

// @desc    Create new SEO page
// @route   POST /api/seo
// @access  Private/SEO Team
const createSEOPage = async (req, res) => {
  try {
    const seoPage = await SEOPage.create({
      ...req.body,
      assignedTo: req.user?.id
    });

    // Calculate initial SEO score
    seoPage.calculateSEOScore();
    await seoPage.save();

    res.status(201).json({
      success: true,
      message: 'SEO page created successfully',
      data: seoPage
    });

  } catch (error) {
    console.error('❌ Create SEO page failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SEO page'
    });
  }
};

// @desc    Update SEO page
// @route   PUT /api/seo/:id
// @access  Private/SEO Team
const updateSEOPage = async (req, res) => {
  try {
    const seoPage = await SEOPage.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastOptimized: new Date()
      },
      { new: true }
    );

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: 'SEO page not found'
      });
    }

    // Recalculate SEO score
    seoPage.calculateSEOScore();
    await seoPage.save();

    res.status(200).json({
      success: true,
      message: 'SEO page updated successfully',
      data: seoPage
    });

  } catch (error) {
    console.error('❌ Update SEO page failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SEO page'
    });
  }
};

// @desc    Delete SEO page
// @route   DELETE /api/seo/:id
// @access  Private/SEO Team
const deleteSEOPage = async (req, res) => {
  try {
    const seoPage = await SEOPage.findByIdAndDelete(req.params.id);

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: 'SEO page not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'SEO page deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete SEO page failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SEO page'
    });
  }
};

// @desc    Run SEO audit on page
// @route   POST /api/seo/:id/audit
// @access  Private/SEO Team
const runSEOAudit = async (req, res) => {
  try {
    const result = await SEOService.auditPage(req.params.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'SEO audit completed successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ SEO audit failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run SEO audit'
    });
  }
};

// @desc    Get SEO statistics
// @route   GET /api/seo/stats
// @access  Private/SEO Team
const getSEOStats = async (req, res) => {
  try {
    const totalPages = await SEOPage.countDocuments();
    const publishedPages = await SEOPage.countDocuments({ status: 'published' });
    const draftPages = await SEOPage.countDocuments({ status: 'draft' });
    
    // Get average SEO score
    const avgScoreResult = await SEOPage.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$seoScore' } } }
    ]);
    const avgSEOScore = avgScoreResult[0]?.avgScore || 0;

    // Get pages with issues
    const pagesWithIssues = await SEOPage.countDocuments({
      'seoIssues.0': { $exists: true }
    });

    // Get high priority issues
    const highPriorityIssues = await SEOPage.countDocuments({
      'seoIssues.priority': 'high'
    });

    // Get recent optimizations
    const recentOptimizations = await SEOPage.find({
      lastOptimized: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalPages,
        publishedPages,
        draftPages,
        avgSEOScore: Math.round(avgSEOScore),
        pagesWithIssues,
        highPriorityIssues,
        recentOptimizations
      }
    });

  } catch (error) {
    console.error('❌ Get SEO stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SEO statistics'
    });
  }
};

// @desc    Generate sitemap
// @route   POST /api/seo/sitemap
// @access  Private/SEO Team
const generateSitemap = async (req, res) => {
  try {
    const result = await SitemapService.generateSitemap();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: `Sitemap generated successfully with ${result.count} URLs`,
      data: {
        sitemap: result.data,
        urlCount: result.count,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Generate sitemap failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sitemap'
    });
  }
};

// @desc    Analyze keywords
// @route   POST /api/seo/keywords/analyze
// @access  Private/SEO Team
const analyzeKeywords = async (req, res) => {
  try {
    const { keywords } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({
        success: false,
        message: 'Keywords array is required'
      });
    }

    const result = await SEOService.analyzeKeywords(keywords);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'Keyword analysis completed',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Keyword analysis failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze keywords'
    });
  }
};

// @desc    Get SEO report
// @route   GET /api/seo/report
// @access  Private/SEO Team
const getSEOReport = async (req, res) => {
  try {
    const dateRange = parseInt(req.query.days) || 30;
    const result = await SEOService.generateSEOReport(dateRange);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: 'SEO report generated successfully',
      data: result.data
    });

  } catch (error) {
    console.error('❌ Generate SEO report failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate SEO report'
    });
  }
};

// @desc    Bulk update meta tags
// @route   PUT /api/seo/bulk/meta-tags
// @access  Private/SEO Team
const bulkUpdateMetaTags = async (req, res) => {
  try {
    const { pageIds, metaData } = req.body;

    if (!pageIds || !Array.isArray(pageIds) || !metaData) {
      return res.status(400).json({
        success: false,
        message: 'Page IDs array and meta data are required'
      });
    }

    const result = await SEOService.bulkUpdateMetaTags(pageIds, metaData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
      message: `Bulk update completed. ${result.data.updated} pages updated, ${result.data.failed} failed.`,
      data: result.data
    });

  } catch (error) {
    console.error('❌ Bulk update meta tags failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update meta tags'
    });
  }
};

module.exports = {
  getSEOData,
  getSEOPage,
  getSEOPageByName,
  createSEOPage,
  updateSEOPage,
  updateSEOPageByName,
  deleteSEOPage,
  runSEOAudit,
  getSEOStats,
  generateSitemap,
  analyzeKeywords,
  getSEOReport,
  bulkUpdateMetaTags
};