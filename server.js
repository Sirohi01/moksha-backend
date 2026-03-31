const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { monitorPerformance } = require('./middleware/intelligenceMiddleware');
const notificationService = require('./services/notificationService');
const sitemapService = require('./services/sitemapService');
const { specs, swaggerUi } = require('./swagger');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const donationRoutes = require('./routes/donationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const boardRoutes = require('./routes/boardRoutes');
const legacyRoutes = require('./routes/legacyRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const expansionRoutes = require('./routes/expansionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const activityRoutes = require('./routes/activityRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contentRoutes = require('./routes/contentRoutes');
const pressRoutes = require('./routes/pressRoutes');
const documentaryRoutes = require('./routes/documentaryRoutes');
const seoRoutes = require('./routes/seoRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const taskRoutes = require('./routes/taskRoutes');
const pageConfigRoutes = require('./routes/pageConfigRoutes');

const app = express();
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Connect to Database
connectDB();

// Performance Monitoring (Latency tracking)
app.use(monitorPerformance);

// Security Middleware
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});
app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://mokshafrontend.netlify.app',
      'https://moksha-seva.org',
      'https://www.mokshasewa.org'
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Moksha Sewa API Documentation'
}));

app.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await sitemapService.generateDynamicSitemap();
    res.set('Content-Type', 'text/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  const robots = sitemapService.generateRobotsTxt();
  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Moksha Sewa API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Handle preflight requests
app.options('*', cors());

// API Routes
const newsletterRoutes = require('./routes/newsletterRoutes');
const complianceRoutes = require('./routes/complianceRoutes');

const chatRoutes = require('./routes/chatRoutes');
const intelligenceRoutes = require('./routes/intelligenceRoutes');
const marketingRoutes = require('./routes/marketingRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/activities', activityRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/legacy', legacyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/expansion', expansionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/press', pressRoutes);
app.use('/api/documentaries', documentaryRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/page-config', pageConfigRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/marketing', marketingRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Moksha Sewa API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🗺️ Sitemap: http://localhost:${PORT}/sitemap.xml`);

  // Auto-seed page configurations on startup (production-safe)
  try {
    const seedPageConfigs = require('./seedPageConfigs');
    const seedSEO = require('./seedSEO');

    const configResult = await seedPageConfigs();
    if (configResult.success) {
      console.log(`📦 Page configs: ${configResult.message}`);
    }

    const seoResult = await seedSEO();
    if (seoResult.success) {
      console.log(`🎯 SEO pages: Created ${seoResult.created}, Skipped ${seoResult.skipped}`);
    }

    console.log(`📦 MongoDB Connected: ${process.env.MONGODB_URI ? 'Remote' : 'localhost'}`);
  } catch (error) {
    console.error('⚠️ Seeding failed:', error.message);
  }
});

// Initialize WebSocket for real-time notifications
notificationService.initializeWebSocket(server);

// Generate sitemap and robots.txt on startup
sitemapService.saveSitemap().catch(console.error);
sitemapService.saveRobotsTxt().catch(console.error);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;