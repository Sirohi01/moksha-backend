const SEOPage = require('../models/SEOPage');
const Content = require('../models/Content');
const Analytics = require('../models/Analytics');
const GlobalSEO = require('../models/GlobalSEO');
const VisitorActivity = require('../models/VisitorActivity');
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

    if (!seoPage) {
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
    const changes = [];
    console.log('🔍 [AUDIT DEBUG] Starting Diff Check for:', seoPage.metaTitle);

    const safeCompare = (v1, v2) => {
      const s1 = String(v1 || '').trim();
      const s2 = String(v2 || '').trim();
      return s1 !== s2;
    };

    if (updateData.metaTitle !== undefined && safeCompare(updateData.metaTitle, seoPage.metaTitle)) {
      console.log(`✅ Change Detected: MetaTitle [DB: ${seoPage.metaTitle}] -> [NEW: ${updateData.metaTitle}]`);
      changes.push("Meta Title");
    }
    if (updateData.metaDescription !== undefined && safeCompare(updateData.metaDescription, seoPage.metaDescription)) changes.push("Description");
    if (updateData.metaKeywords !== undefined && safeCompare(updateData.metaKeywords, seoPage.metaKeywords)) changes.push("Keywords");
    if (updateData.robots !== undefined && safeCompare(updateData.robots, seoPage.robots)) changes.push("Crawl Protocols");
    if (updateData.status !== undefined && updateData.status !== seoPage.status) changes.push(`Status (${updateData.status})`);

    if (changes.length > 0) {
      if (!seoPage.notes) seoPage.notes = [];
      const newNote = {
        note: `Protocol Calibration: [${changes.join(', ')}] orchestrated by ${req.admin?.name || req.admin?.email || 'System Admin'}`,
        addedBy: req.admin?._id,
        addedAt: new Date()
      };
      seoPage.notes.unshift(newNote);
      if (seoPage.notes.length > 50) seoPage.notes = seoPage.notes.slice(0, 50);
      seoPage.markModified('notes');
    }
    const { notes: incomingNotes, ...sanitizedUpdateData } = updateData;
    Object.assign(seoPage, {
      ...sanitizedUpdateData,
      lastOptimized: new Date(),
      status: updateData.status || seoPage.status || 'published'
    });

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
    const { _id, __v, ...updateData } = req.body;
    let seoPage = await SEOPage.findById(req.params.id);

    if (!seoPage) {
      return res.status(404).json({
        success: false,
        message: 'Strategic Search Node not found in registry'
      });
    }
    const changes = [];
    console.log('🔍 [AUDIT DEBUG] Starting ID-Based Diff Check for:', seoPage.metaTitle);

    const safeCompare = (v1, v2) => {
      const s1 = String(v1 || '').trim();
      const s2 = String(v2 || '').trim();
      return s1 !== s2;
    };

    if (updateData.metaTitle !== undefined && safeCompare(updateData.metaTitle, seoPage.metaTitle)) {
      console.log(`✅ Change Detected: MetaTitle [DB: ${seoPage.metaTitle}] -> [NEW: ${updateData.metaTitle}]`);
      changes.push("Meta Title");
    }
    if (updateData.metaDescription !== undefined && safeCompare(updateData.metaDescription, seoPage.metaDescription)) changes.push("Description");
    if (updateData.metaKeywords !== undefined && safeCompare(updateData.metaKeywords, seoPage.metaKeywords)) changes.push("Keywords");
    if (updateData.robots !== undefined && safeCompare(updateData.robots, seoPage.robots)) changes.push("Crawl Protocols");
    if (updateData.status !== undefined && updateData.status !== seoPage.status) changes.push(`Status (${updateData.status})`);

    console.log('📊 [AUDIT DEBUG] Total Changes Found:', changes.length);

    if (changes.length > 0) {
      if (!seoPage.notes) seoPage.notes = [];
      const newNote = {
        note: `Protocol Calibration: [${changes.join(', ')}] orchestrated by ${req.admin?.name || req.admin?.email || 'System Admin'}`,
        addedBy: req.admin?._id,
        addedAt: new Date()
      };
      seoPage.notes.unshift(newNote);
      if (seoPage.notes.length > 50) seoPage.notes = seoPage.notes.slice(0, 50);
      seoPage.markModified('notes');
      console.log('📝 [AUDIT DEBUG] Note Pushed to Array');
    }

    // Perform state mutation
    // EXCLUDE 'notes' to prevent overwriting server-generated audit logs
    const { notes: incomingNotes, ...sanitizedUpdateData } = updateData;
    Object.assign(seoPage, {
      ...sanitizedUpdateData,
      lastOptimized: new Date(),
      status: updateData.status || seoPage.status || 'published'
    });

    if (seoPage.calculateSEOScore) {
      seoPage.calculateSEOScore();
    }

    if (updateData.imageAltMappings) seoPage.markModified('imageAltMappings');
    if (updateData.schemaMarkup) seoPage.markModified('schemaMarkup');

    await seoPage.save();

    res.status(200).json({
      success: true,
      message: 'Evolutionary Audit Logged: Search Node synchronized successfully',
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
const getRealTimeAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const totalStats = await VisitorActivity.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalPageviews: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    const trafficStats = await VisitorActivity.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $project: {
          source: {
            $cond: [
              { $or: [{ $not: ['$referer'] }, { $eq: ['$referer', ''] }] },
              'Direct',
              {
                $cond: [
                  { $regexMatch: { input: '$referer', regex: 'google|bing|yahoo|duckduckgo', options: 'i' } },
                  'Organic Search',
                  {
                    $cond: [
                      { $regexMatch: { input: '$referer', regex: 'facebook|twitter|instagram|linkedin|t\\.co|lnkd\\.in', options: 'i' } },
                      'Social Media',
                      'Referral'
                    ]
                  }
                ]
              }
            ]
          }
        }
      },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. Popular Pages & Behavioral Depth
    const popularPages = await VisitorActivity.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' },
          avgTime: { $avg: '$duration' }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);

    // 4. Multi-Layered Geography Intelligence
    const geoStats = await VisitorActivity.aggregate([
      { $match: { createdAt: { $gte: startDate }, 'location.country': { $exists: true } } },
      {
        $facet: {
          countries: [
            { $group: { _id: '$location.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          cities: [
            { $group: { _id: { city: '$location.city', country: '$location.country' }, count: { $sum: 1 } } },
            { $match: { '_id.city': { $ne: 'Unknown' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    // 5. Technical Telemetry (Devices & OS)
    const activities = await VisitorActivity.find({ createdAt: { $gte: startDate } }).select('userAgent');
    const technicalStats = {
      devices: { mobile: 0, desktop: 0, tablet: 0 },
      os: { ios: 0, android: 0, windows: 0, mac: 0, linux: 0, other: 0 }
    };

    activities.forEach(a => {
      const ua = (a.userAgent || '').toLowerCase();

      // Device Parsing
      if (ua.includes('mobile')) technicalStats.devices.mobile++;
      else if (ua.includes('tablet')) technicalStats.devices.tablet++;
      else technicalStats.devices.desktop++;

      // OS Parsing
      if (ua.includes('iphone') || ua.includes('ipad')) technicalStats.os.ios++;
      else if (ua.includes('android')) technicalStats.os.android++;
      else if (ua.includes('windows')) technicalStats.os.windows++;
      else if (ua.includes('macintosh')) technicalStats.os.mac++;
      else if (ua.includes('linux')) technicalStats.os.linux++;
      else technicalStats.os.other++;
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPageviews: totalStats[0]?.totalPageviews || 0,
          uniqueVisitors: totalStats[0]?.uniqueVisitors?.length || 0,
          avgDuration: Math.round(totalStats[0]?.avgDuration || 0)
        },
        trafficSources: trafficStats.map(s => ({
          name: s._id,
          value: s.count
        })),
        popularPages: popularPages.map(p => ({
          path: p._id,
          views: p.views,
          uniqueVisitors: p.uniqueVisitors.length,
          avgEngagement: Math.round(p.avgTime || 0)
        })),
        geoIntensity: {
          countries: (geoStats[0]?.countries || []).map(g => ({ name: g._id, count: g.count })),
          cities: (geoStats[0]?.cities || []).map(g => ({ name: `${g._id.city}, ${g._id.country}`, count: g.count }))
        },
        technicalStats
      }
    });

  } catch (error) {
    console.error('❌ Real-Time Analytics Breach:', error);
    res.status(500).json({
      success: false,
      message: 'Critical analytics pipeline failure'
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
  getGlobalRedirects,
  getRealTimeAnalytics
};