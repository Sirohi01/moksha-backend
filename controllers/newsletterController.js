const NewsletterSubscription = require('../models/NewsletterSubscription');
exports.subscribe = async (req, res) => {
  try {
    const { email, phone, communicationPreference, source } = req.body;

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
        if (phone) subscriber.phone = phone;
        if (communicationPreference) subscriber.communicationPreference = communicationPreference;
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
      phone,
      communicationPreference: communicationPreference || 'email',
      source: source || 'blog_page'
    });

    // Send WhatsApp Welcome if opted in
    if (phone && (communicationPreference === 'whatsapp' || communicationPreference === 'both')) {
      const { sendWhatsAppMessage } = require('../services/whatsappService');
      const welcomeMsg = `MOKSHA SEWA: Thank you for subscribing to our updates! We'll keep you posted on our mission and impact stories. - Team Moksha`;
      await sendWhatsAppMessage(phone, welcomeMsg);
    }

    // Send admin notification
    const { sendEmail } = require('../services/emailService');
    await sendEmail(process.env.ADMIN_EMAIL, 'newsletterAdminNotification', {
      email: subscriber.email,
      source: subscriber.source
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

exports.getSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      NewsletterSubscription.find().sort('-subscribedAt').skip(skip).limit(limit),
      NewsletterSubscription.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
};
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
exports.broadcastNewsletter = async (req, res) => {
  try {
    const { subject, html, segment } = req.body;

    if (!subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and html content'
      });
    }

    // Determine target subscribers
    let filter = { status: 'active' };
    if (segment && segment !== 'all') {
      filter.source = segment;
    }

    const subscribers = await NewsletterSubscription.find(filter);

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found for this segment'
      });
    }

    const { uploadToCloudinary } = require('../services/cloudinaryService');
    const { sendEmail } = require('../services/emailService');

    let processedHtml = html;

    // Detect and host base64 images to ensure they show in email clients
    const base64Regex = /src="(data:image\/[^;]+;base64,[^"]+)"/g;
    const matches = [...html.matchAll(base64Regex)];

    for (const match of matches) {
      const base64Data = match[1];
      try {
        // Convert base64 to buffer for Cloudinary
        const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
        const uploadRes = await uploadToCloudinary({ buffer }, 'newsletters');
        processedHtml = processedHtml.replace(base64Data, uploadRes.url);
        console.log('✅ Hosted base64 image to Cloudinary:', uploadRes.url);
      } catch (uploadError) {
        console.error('⚠️ Failed to upload image to Cloudinary, sending as base64:', uploadError);
      }
    }

    // Wrap with Brand Header
    const finalHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="padding: 32px 24px; text-align: center; border-bottom: 2px solid #f1f5f9; background: #ffffff;">
          <img src="https://res.cloudinary.com/dr8mld4i0/image/upload/v1774522601/newsletters/moksha_logo_official.png" alt="Moksha Sewa" style="height: 60px; display: inline-block;" />
          <div style="color: #000080; font-size: 11px; font-weight: 900; letter-spacing: 0.4em; margin-top: 12px; text-transform: uppercase;">Liberation Through Service</div>
        </div>
        <div style="padding: 0;">
          ${processedHtml}
        </div>
        <div style="padding: 40px 24px; background: #ffffff; text-align: center; border-top: 1px solid #f1f5f9;">
          <div style="color: #000080; font-weight: 800; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Moksha Sewa Foundation</div>
          <div style="color: #64748b; font-size: 11px; line-height: 1.6;">
            The final dignity for every soul.<br/>
            © ${new Date().getFullYear()} Moksha Sewa. All Rights Reserved.
          </div>
        </div>
      </div>
    `;

    const results = await Promise.all(
      subscribers.map(sub =>
        sendEmail(sub.email, 'customHtml', { subject, html: finalHtml })
      )
    );

    res.status(200).json({
      success: true,
      message: `Broadcast initiated to ${subscribers.length} nodes`,
      count: subscribers.length
    });

  } catch (error) {
    console.error('❌ Broadcast failed:', error);
    res.status(500).json({
      success: false,
      message: 'Critical error during broadcast transmission'
    });
  }
};
