const SEOPage = require('../models/SEOPage');
const Content = require('../models/Content');
const Analytics = require('../models/Analytics');

class SEOService {
  // SEO Audit Functions
  static async auditPage(pageId) {
    try {
      const page = await SEOPage.findById(pageId);
      if (!page) {
        throw new Error('Page not found');
      }

      const issues = [];
      const recommendations = [];

      // Check meta title
      if (!page.metaTitle) {
        issues.push({
          type: 'error',
          message: 'Missing meta title',
          priority: 'high'
        });
      } else if (page.metaTitle.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Meta title is too short (less than 30 characters)',
          priority: 'medium'
        });
      } else if (page.metaTitle.length > 60) {
        issues.push({
          type: 'error',
          message: 'Meta title is too long (more than 60 characters)',
          priority: 'high'
        });
      }

      // Check meta description
      if (!page.metaDescription) {
        issues.push({
          type: 'error',
          message: 'Missing meta description',
          priority: 'high'
        });
      } else if (page.metaDescription.length < 120) {
        issues.push({
          type: 'warning',
          message: 'Meta description is too short (less than 120 characters)',
          priority: 'medium'
        });
      } else if (page.metaDescription.length > 160) {
        issues.push({
          type: 'error',
          message: 'Meta description is too long (more than 160 characters)',
          priority: 'high'
        });
      }

      // Check content length
      if (page.wordCount < 300) {
        issues.push({
          type: 'warning',
          message: 'Content is too short (less than 300 words)',
          priority: 'medium'
        });
      }

      // Check Open Graph tags
      if (!page.ogTitle || !page.ogDescription || !page.ogImage) {
        issues.push({
          type: 'warning',
          message: 'Missing Open Graph tags',
          priority: 'medium'
        });
      }

      // Check canonical URL
      if (!page.canonicalUrl) {
        issues.push({
          type: 'info',
          message: 'Missing canonical URL',
          priority: 'low'
        });
      }

      // Check target keywords
      if (!page.targetKeywords || page.targetKeywords.length === 0) {
        issues.push({
          type: 'warning',
          message: 'No target keywords defined',
          priority: 'medium'
        });
      }

      // Generate recommendations
      if (page.seoScore < 70) {
        recommendations.push('Improve meta tags and content optimization');
      }
      if (page.wordCount < 500) {
        recommendations.push('Add more comprehensive content');
      }
      if (!page.schemaMarkup) {
        recommendations.push('Add structured data markup');
      }

      // Update page with audit results
      page.seoIssues = issues;
      page.lastAuditDate = new Date();
      page.auditResults = {
        issues: issues.length,
        recommendations: recommendations.length,
        score: page.calculateSEOScore()
      };

      await page.save();

      return {
        success: true,
        data: {
          issues,
          recommendations,
          score: page.seoScore,
          auditDate: page.lastAuditDate
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Keyword Analysis
  static async analyzeKeywords(keywords) {
    try {
      const analysis = [];

      for (const keyword of keywords) {
        // Simulate keyword analysis (in real app, integrate with SEO APIs)
        const keywordData = {
          keyword: keyword,
          searchVolume: Math.floor(Math.random() * 10000) + 100,
          difficulty: Math.floor(Math.random() * 100) + 1,
          cpc: (Math.random() * 5).toFixed(2),
          competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          relatedKeywords: this.generateRelatedKeywords(keyword)
        };

        analysis.push(keywordData);
      }

      return {
        success: true,
        data: analysis
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Generate related keywords (simplified)
  static generateRelatedKeywords(keyword) {
    const prefixes = ['best', 'top', 'how to', 'what is', 'why'];
    const suffixes = ['guide', 'tips', 'benefits', 'cost', 'near me'];
    
    const related = [];
    
    // Add some prefixes
    for (let i = 0; i < 2; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      related.push(`${prefix} ${keyword}`);
    }
    
    // Add some suffixes
    for (let i = 0; i < 2; i++) {
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      related.push(`${keyword} ${suffix}`);
    }
    
    return related;
  }

  // Content Optimization Suggestions
  static async getContentSuggestions(contentId) {
    try {
      const content = await Content.findById(contentId);
      if (!content) {
        throw new Error('Content not found');
      }

      const suggestions = [];

      // Check content length
      if (content.wordCount < 300) {
        suggestions.push({
          type: 'content_length',
          message: 'Consider adding more content. Aim for at least 300 words.',
          priority: 'medium'
        });
      }

      // Check headings structure
      const headingPattern = /<h[1-6][^>]*>/gi;
      const headings = content.content.match(headingPattern) || [];
      
      if (headings.length === 0) {
        suggestions.push({
          type: 'headings',
          message: 'Add headings (H1, H2, H3) to improve content structure.',
          priority: 'high'
        });
      }

      // Check for focus keyword usage
      if (content.focusKeyword) {
        const keywordCount = (content.content.toLowerCase().match(new RegExp(content.focusKeyword.toLowerCase(), 'g')) || []).length;
        const keywordDensity = (keywordCount / content.wordCount) * 100;
        
        if (keywordDensity < 0.5) {
          suggestions.push({
            type: 'keyword_density',
            message: 'Consider using your focus keyword more frequently in the content.',
            priority: 'medium'
          });
        } else if (keywordDensity > 3) {
          suggestions.push({
            type: 'keyword_density',
            message: 'Reduce keyword usage to avoid over-optimization.',
            priority: 'medium'
          });
        }
      }

      // Check for images
      const imagePattern = /<img[^>]*>/gi;
      const images = content.content.match(imagePattern) || [];
      
      if (images.length === 0) {
        suggestions.push({
          type: 'images',
          message: 'Add relevant images to make content more engaging.',
          priority: 'low'
        });
      }

      // Check for internal links
      const linkPattern = /<a[^>]*href=[^>]*>/gi;
      const links = content.content.match(linkPattern) || [];
      
      if (links.length < 2) {
        suggestions.push({
          type: 'internal_links',
          message: 'Add internal links to other relevant pages.',
          priority: 'medium'
        });
      }

      return {
        success: true,
        data: {
          suggestions,
          wordCount: content.wordCount,
          readingTime: content.readingTime,
          readabilityScore: content.readabilityScore
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Generate SEO Report
  static async generateSEOReport(dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get all SEO pages
      const pages = await SEOPage.find({});
      
      // Get analytics data
      const analyticsData = await Analytics.find({
        date: { $gte: startDate }
      });

      // Calculate overall metrics
      const totalPages = pages.length;
      const publishedPages = pages.filter(p => p.status === 'published').length;
      const avgSEOScore = pages.reduce((sum, p) => sum + p.seoScore, 0) / totalPages;
      
      const totalIssues = pages.reduce((sum, p) => sum + (p.seoIssues?.length || 0), 0);
      const highPriorityIssues = pages.reduce((sum, p) => {
        return sum + (p.seoIssues?.filter(issue => issue.priority === 'high').length || 0);
      }, 0);

      // Top performing pages
      const topPages = pages
        .sort((a, b) => b.seoScore - a.seoScore)
        .slice(0, 10)
        .map(p => ({
          title: p.title,
          url: p.url,
          seoScore: p.seoScore,
          pageViews: p.pageViews,
          organicTraffic: p.organicTraffic
        }));

      // Pages needing attention
      const needsAttention = pages
        .filter(p => p.seoScore < 60 || (p.seoIssues && p.seoIssues.some(issue => issue.priority === 'high')))
        .sort((a, b) => a.seoScore - b.seoScore)
        .slice(0, 10)
        .map(p => ({
          title: p.title,
          url: p.url,
          seoScore: p.seoScore,
          issues: p.seoIssues?.length || 0,
          highPriorityIssues: p.seoIssues?.filter(issue => issue.priority === 'high').length || 0
        }));

      // Keyword performance
      const allKeywords = pages.reduce((acc, page) => {
        if (page.targetKeywords) {
          acc.push(...page.targetKeywords);
        }
        return acc;
      }, []);

      const keywordStats = {
        totalKeywords: allKeywords.length,
        avgPosition: allKeywords.reduce((sum, k) => sum + (k.currentRank || 0), 0) / allKeywords.length,
        topRankingKeywords: allKeywords.filter(k => k.currentRank && k.currentRank <= 10).length
      };

      return {
        success: true,
        data: {
          overview: {
            totalPages,
            publishedPages,
            avgSEOScore: Math.round(avgSEOScore),
            totalIssues,
            highPriorityIssues
          },
          topPages,
          needsAttention,
          keywordStats,
          generatedAt: new Date()
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  // Bulk SEO Operations
  static async bulkUpdateMetaTags(pageIds, metaData) {
    try {
      const results = [];

      for (const pageId of pageIds) {
        const page = await SEOPage.findById(pageId);
        if (page) {
          if (metaData.metaTitle) page.metaTitle = metaData.metaTitle;
          if (metaData.metaDescription) page.metaDescription = metaData.metaDescription;
          if (metaData.metaKeywords) page.metaKeywords = metaData.metaKeywords;
          
          page.calculateSEOScore();
          await page.save();
          
          results.push({
            pageId,
            title: page.title,
            success: true
          });
        } else {
          results.push({
            pageId,
            success: false,
            error: 'Page not found'
          });
        }
      }

      return {
        success: true,
        data: {
          updated: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      };

    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

module.exports = SEOService;