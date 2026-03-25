const fs = require('fs');
const path = require('path');

class SitemapService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'https://MokshaSewa.org';
    this.staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/about', priority: '0.9', changefreq: 'monthly' },
      { url: '/contact', priority: '0.8', changefreq: 'monthly' },
      { url: '/volunteer', priority: '0.8', changefreq: 'monthly' },
      { url: '/donate', priority: '0.9', changefreq: 'monthly' },
      { url: '/gallery', priority: '0.7', changefreq: 'weekly' },
      { url: '/press', priority: '0.6', changefreq: 'weekly' },
      { url: '/reports', priority: '0.7', changefreq: 'monthly' },
      { url: '/board/apply', priority: '0.6', changefreq: 'monthly' },
      { url: '/legacy-giving/request-info', priority: '0.6', changefreq: 'monthly' },
      { url: '/schemes/apply', priority: '0.7', changefreq: 'monthly' },
      { url: '/expansion', priority: '0.6', changefreq: 'monthly' }
    ];
  }

  generateSitemap() {
    const currentDate = new Date().toISOString().split('T')[0];

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    this.staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return sitemap;
  }

  async generateDynamicSitemap() {
    try {
      // Import models dynamically to avoid circular dependencies
      const Content = require('../models/Content');
      const PressRelease = require('../models/PressRelease');
      const Report = require('../models/Report');

      const currentDate = new Date().toISOString().split('T')[0];
      let sitemap = this.generateSitemap();

      // Add dynamic content pages
      const contents = await Content.find({ status: 'published' }).select('slug updatedAt');
      const pressReleases = await PressRelease.find({ status: 'published' }).select('slug updatedAt');
      const reports = await Report.find({ status: 'published' }).select('slug updatedAt');

      // Remove closing tag to add dynamic content
      sitemap = sitemap.replace('</urlset>', '');

      // Add content pages
      contents.forEach(content => {
        const lastmod = content.updatedAt ? content.updatedAt.toISOString().split('T')[0] : currentDate;
        sitemap += `
  <url>
    <loc>${this.baseUrl}/content/${content.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });

      // Add press releases
      pressReleases.forEach(press => {
        const lastmod = press.updatedAt ? press.updatedAt.toISOString().split('T')[0] : currentDate;
        sitemap += `
  <url>
    <loc>${this.baseUrl}/press/${press.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
      });

      // Add reports
      reports.forEach(report => {
        const lastmod = report.updatedAt ? report.updatedAt.toISOString().split('T')[0] : currentDate;
        sitemap += `
  <url>
    <loc>${this.baseUrl}/reports/${report.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });

      // Close sitemap
      sitemap += `
</urlset>`;

      return sitemap;
    } catch (error) {
      console.error('Error generating dynamic sitemap:', error);
      return this.generateSitemap(); // Fallback to static sitemap
    }
  }

  async saveSitemap() {
    try {
      const sitemap = await this.generateDynamicSitemap();
      const sitemapPath = path.join(__dirname, '../../public/sitemap.xml');

      // Ensure public directory exists
      const publicDir = path.dirname(sitemapPath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(sitemapPath, sitemap);
      console.log('✅ Sitemap generated successfully');
      return sitemapPath;
    } catch (error) {
      console.error('Error saving sitemap:', error);
      throw error;
    }
  }

  generateRobotsTxt() {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow important pages
Allow: /
Allow: /about
Allow: /contact
Allow: /volunteer
Allow: /donate
Allow: /gallery
Allow: /press
Allow: /reports`;
  }

  async saveRobotsTxt() {
    try {
      const robots = this.generateRobotsTxt();
      const robotsPath = path.join(__dirname, '../../public/robots.txt');

      // Ensure public directory exists
      const publicDir = path.dirname(robotsPath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(robotsPath, robots);
      console.log('✅ Robots.txt generated successfully');
      return robotsPath;
    } catch (error) {
      console.error('Error saving robots.txt:', error);
      throw error;
    }
  }
}

module.exports = new SitemapService();