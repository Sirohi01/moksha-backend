const NewsletterSubscription = require('../models/NewsletterSubscription');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Check if subscriber already exists
    let subscriber = await NewsletterSubscription.findOne({ email });

    if (subscriber) {
      if (subscriber.status === 'unsubscribed') {
        subscriber.status = 'active';
        subscriber.subscribedAt = Date.now();
        await subscriber.save();
        return res.status(200).json({
          success: true,
          message: 'Resubscribed successfully!'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    subscriber = await NewsletterSubscription.create({
      email,
      source: source || 'blog_page'
    });

    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter!'
    });
  } catch (error) {
    console.error('❌ Newsletter subscription failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter'
    });
  }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscription.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('❌ Failed to fetch subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   PUT /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await NewsletterSubscription.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    console.error('❌ Newsletter unsubscription failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe'
    });
  }
};
