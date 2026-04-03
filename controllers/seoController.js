const SEOPage = require('../models/SEOPage');
const Content = require('../models/Content');
const Analytics = require('../models/Analytics');
const SEOService = require('../services/seoService');
const SitemapService = require('../services/sitemapService');
const getSEOData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const validContent = await Content.find({
      type: { $in: ['page_config', 'blog', 'press', 'documentary', 'page'] }
    }).select('slug title type');

    const validSlugs = validContent.map(c => c.slug);
    const existingSEO = await SEOPage.find({ slug: { $in: validSlugs } });
    const existingSlugs = existingSEO.map(s => s.slug);
    const missingContent = validContent.filter(c => !existingSlugs.includes(c.slug));

    if (missingContent.length > 0) {
      const newSEOPages = missingContent.map(c => ({
        title: c.title,
        slug: c.slug,
        url: `/${c.slug}`,
        metaTitle: `${c.title} | Moksha Sewa`,
        metaDescription: `Discover ${c.title} at Moksha Sewa - Dignity in Departure.`,
        status: 'draft',
        contentType: c.type === 'page_config' ? 'page' : c.type
      }));
      await SEOPage.insertMany(newSEOPages);
    }

    const seoPages = await SEOPage.find({ slug: { $in: validSlugs } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SEOPage.countDocuments({ slug: { $in: validSlugs } });

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
const getSEOPageByName = async (req, res) => {
  try {
    const { pageName } = req.params;
    let seoPage = await SEOPage.findOne({
      $or: [
        { slug: pageName },
        { url: `/${pageName}` },
        { url: pageName },
        { title: new RegExp(pageName, 'i') }
      ]
    });
    if (!seoPage) {
      seoPage = new SEOPage({
        title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`,
        slug: pageName,
        url: `/${pageName}`,
        metaTitle: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Moksha Sewa`,
        metaDescription: `Learn more about ${pageName} at Moksha Sewa - Dignity in Departure`,
        metaKeywords: `Moksha Sewa, ${pageName}, cremation services, humanitarian`,
        ogTitle: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Moksha Sewa`,
        ogDescription: `Learn more about ${pageName} at Moksha Sewa - Dignity in Departure`,
        ogType: 'website',
        schemaType: 'WebPage',
        robots: 'index, follow',
        status: 'draft',
        assignedTo: req.admin ? req.admin._id : null,
        priority: 'medium'
      });
      seoPage.calculateSEOScore();
      await seoPage.save();
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
const updateSEOPageByName = async (req, res) => {
  try {
    const { pageName } = req.params;
    const updateData = req.body;
    let seoPage = await SEOPage.findOne({
      $or: [
        { slug: pageName },
        { url: `/${pageName}` },
        { url: pageName }
      ]
    });

    if (seoPage) {
      Object.assign(seoPage, {
        ...updateData,
        lastOptimized: new Date(),
        status: updateData.status || 'published'
      });
    } else {
      seoPage = new SEOPage({
        title: updateData.title || `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page`,
        slug: pageName,
        url: updateData.url || `/${pageName}`,
        metaTitle: updateData.metaTitle || `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} | Moksha Sewa`,
        metaDescription: updateData.metaDescription || `Learn more about ${pageName} at Moksha Sewa`,
        metaKeywords: updateData.metaKeywords || updateData.keywords || `Moksha Sewa, ${pageName}`,
        ogTitle: updateData.ogTitle || updateData.metaTitle,
        ogDescription: updateData.ogDescription || updateData.metaDescription,
        ogImage: updateData.ogImage,
        canonicalUrl: updateData.canonicalUrl,
        robots: updateData.robots || 'index, follow',
        schemaType: updateData.schemaType || 'WebPage',
        status: updateData.status || 'published',
        assignedTo: req.admin._id,
        priority: updateData.priority || 'medium',
        lastOptimized: new Date()
      });
    }
    if (seoPage.calculateSEOScore) {
      seoPage.calculateSEOScore();
    }

    if (updateData.imageAltMappings) {
      seoPage.markModified('imageAltMappings');
    }
    if (updateData.schemaMarkup) {
      seoPage.markModified('schemaMarkup');
    }

    await seoPage.save();

    res.status(200).json({
      success: true,
      message: `SEO Protocol Synchronized: '${pageName}' optimized successfully`,
      data: seoPage
    });

  } catch (error) {
    console.error('❌ SEO Sync Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'SEO Synchronization Failed'
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
const createSEOPage = async (req, res) => {
  try {
    const seoPage = await SEOPage.create({
      ...req.body,
      assignedTo: req.user?.id
    });
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
const updateSEOPage = async (req, res) => {
  try {
    const { _id, __v, ...updateFields } = req.body;
    
    const seoPage = await SEOPage.findByIdAndUpdate(
      req.params.id,
      {
        ...updateFields,
        lastOptimized: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: 'SEO page not found'
      });
    }
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
const getSEOStats = async (req, res) => {
  try {
    const totalPages = await SEOPage.countDocuments();
    const publishedPages = await SEOPage.countDocuments({ status: 'published' });
    const draftPages = await SEOPage.countDocuments({ status: 'draft' });
    const avgScoreResult = await SEOPage.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$seoScore' } } }
    ]);
    const avgSEOScore = avgScoreResult[0]?.avgScore || 0;
    const pagesWithIssues = await SEOPage.countDocuments({
      'seoIssues.0': { $exists: true }
    });
    const highPriorityIssues = await SEOPage.countDocuments({
      'seoIssues.priority': 'high'
    });
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
const getGlobalRedirects = async (req, res) => {
  try {
    const seoPages = await SEOPage.find({
      $and: [
        { redirects: { $exists: true } },
        { redirects: { $ne: '' } }
      ]
    }).select('redirects');

    let allRedirects = [];
    seoPages.forEach(p => {
      const lines = p.redirects.split('\n').filter(l => l.includes('>'));
      lines.forEach(line => {
        const [source, target] = line.split('>').map(s => s.trim());
        if (source && target) {
          allRedirects.push({ source, target });
        }
      });
    });

    res.status(200).json({
      success: true,
      data: allRedirects
    });
  } catch (error) {
    console.error('❌ Get redirects failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch global redirects'
    });
  }
};

const GlobalSEO = require('../models/GlobalSEO');
const getGlobalSEO = async (req, res) => {
  try {
    let settings = await GlobalSEO.findOne();
    if (!settings) {
      settings = await GlobalSEO.create({
        headerScripts: '',
        footerScripts: '',
        lastUpdated: new Date()
      });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('❌ Get global SEO failed:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch global SEO' });
  }
};

const updateGlobalSEO = async (req, res) => {
  try {
    const updateData = req.body;
    let settings = await GlobalSEO.findOne();
    if (!settings) {
      settings = new GlobalSEO({});
    }

    Object.assign(settings, updateData);
    settings.lastUpdated = new Date();
    settings.updatedBy = req.admin ? req.admin.name : 'Unknown Admin';
    await settings.save();

    res.status(200).json({ success: true, message: 'Global SEO parameters synchronized', data: settings });
  } catch (error) {
    console.error('❌ Update global SEO failed:', error);
    res.status(500).json({ success: false, message: 'Failed to update global SEO' });
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
  bulkUpdateMetaTags,
  getGlobalSEO,
  updateGlobalSEO,
  getGlobalRedirects
};