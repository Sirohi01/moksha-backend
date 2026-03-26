const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

const createTransporter = () => {
  console.log(`📧 Creating email transporter...`);

  // Use Gmail SMTP for both development and production
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000
  };

  console.log(`📧 Transporter config:`, {
    environment: process.env.NODE_ENV || 'development',
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    provider: 'Gmail SMTP',
    timeouts: {
      connection: config.connectionTimeout,
      greeting: config.greetingTimeout,
      socket: config.socketTimeout
    }
  });

  return nodemailer.createTransport(config);
};
const emailTemplates = {
  wrapAdminTemplate: (title, subtitle, content, color = '#000080') => `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid rgba(0,0,128,0.1); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
      <div style="background: linear-gradient(135deg, #000080 0%, #000050 100%); padding: 50px 30px; text-align: center; color: white; position: relative; border-bottom: 5px solid #f4c430;">
        <div style="background: rgba(244, 196, 48, 0.1); border: 1px solid rgba(244, 196, 48, 0.3); display: inline-block; padding: 6px 16px; border-radius: 100px; margin-bottom: 20px;">
           <span style="color: #f4c430; font-size: 10px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">Moksha Intelligence</span>
        </div>
        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2;">${title}</h1>
        <p style="margin: 12px 0 0 0; opacity: 0.8; font-size: 14px; font-weight: 400; font-style: italic;">${subtitle}</p>
      </div>
      <div style="padding: 40px; background-color: white;">
        ${content}
      </div>
      <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
        <div style="margin-bottom: 15px;">
           <span style="background: #000080; color: white; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 800;">ADMIN NOTICE</span>
        </div>
        <p style="margin: 0; color: #1e293b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
          Moksha Sewa Foundation • Humanitarian Logistics
        </p>
        <p style="margin: 8px 0 0 0; color: #64748b; font-size: 11px; line-height: 1.5;">
          This message is intended for authorized administrators of the Moksha Sewa platform. 
          Generated via <span style="color: #000080; font-weight: bold;">Moksha Core v2.4</span> on ${new Date().toLocaleString('en-IN')}
        </p>
      </div>
    </div>
  `,

  // OTP Verification Template
  otpVerification: (data) => ({
    subject: `Verification Code: ${data.otp} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Verification Required</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Moksha Sewa Security</p>
        </div>
        
        <div style="padding: 0 10px; text-align: center;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Your One-Time Password (OTP)</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Please use the following code to verify your email address. This code is valid for 5 minutes.</p>
          
          <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px auto; display: inline-block; border: 2px dashed #3b82f6; width: 80%;">
            <h1 style="margin: 0; font-size: 40px; letter-spacing: 12px; color: #1e3a8a; font-family: 'Courier New', Courier, monospace;">${data.otp}</h1>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 40px;">
            <p style="color: #374151; margin: 0; font-weight: bold;">Moksha Sewa Team</p>
            <p style="color: #64748b; margin: 5px 0; font-size: 12px;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  }),

  // Report Form Templates
  reportConfirmation: (data) => ({
    subject: `Report Received - Case #${data.caseNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f4c430, #20b2aa); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🙏 Report Received - Moksha Sewa</h2>
        </div>
        <p>Dear ${data.reporterName || 'Reporter'},</p>
        <p>Thank you for reporting an unclaimed body. Your report has been received and assigned case number: <strong>${data.caseNumber}</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f4c430;">
          <h3 style="color: #333; margin-top: 0;">Case Details:</h3>
          <p><strong>Case Number:</strong> ${data.caseNumber}</p>
          <p><strong>Location:</strong> ${data.exactLocation}, ${data.area}, ${data.city}</p>
          <p><strong>Date Reported:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeaa7;">
          <p style="margin: 0;"><strong>⏰ Next Steps:</strong></p>
          <p style="margin: 5px 0;">• Our team will respond within 24 hours</p>
          <p style="margin: 5px 0;">• You will receive updates via email and SMS</p>
          <p style="margin: 5px 0;">• For urgent assistance, call: <strong>1800-123-456</strong></p>
        </div>
        <p style="margin-top: 20px;">Thank you for your service to humanity.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  reportStatusUpdate: (data) => ({
    subject: `Report Status Update - Case #${data.caseNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f4c430, #20b2aa); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Case Status Update</h2>
        </div>
        <p>Dear ${data.reporterName || 'Reporter'},</p>
        <p>We have an update regarding your report case #${data.caseNumber}.</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f4c430;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Case Number:</strong> ${data.caseNumber}</p>
          <p><strong>Location:</strong> ${data.exactLocation}, ${data.city}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'resolved' ? '#059669' : data.status === 'closed' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'in_progress' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Our team is actively working on this case</p>
          <p style="margin: 5px 0;">• We will provide regular updates on progress</p>
          <p style="margin: 5px 0;">• Expected resolution within 24-48 hours</p>
        </div>
        ` : ''}
        ${data.status === 'resolved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>✅ Case Resolved:</strong></p>
          <p style="margin: 5px 0;">• The case has been successfully resolved</p>
          <p style="margin: 5px 0;">• Appropriate arrangements have been made</p>
          <p style="margin: 5px 0;">• Thank you for your prompt reporting</p>
        </div>
        ` : ''}
        ${data.status === 'closed' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>📁 Case Closed:</strong></p>
          <p style="margin: 5px 0;">• This case has been closed</p>
          <p style="margin: 5px 0;">• All necessary actions have been completed</p>
          <p style="margin: 5px 0;">• Thank you for your cooperation</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for your service to humanity.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Feedback Form Templates
  feedbackThankYou: (data) => ({
    subject: `Thank You for Your Feedback - ${data.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">💚 Thank You - Moksha Sewa</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for sharing your valuable feedback with us. Your voice matters and helps us improve our services.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #333; margin-top: 0;">Feedback Summary:</h3>
          <p><strong>Reference:</strong> ${data.referenceNumber}</p>
          <p><strong>Type:</strong> ${data.feedbackType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(data.experienceRating)} (${data.experienceRating}/5)</p>
        </div>
        <p>Your feedback helps us serve better and reach more people in need.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  feedbackResponse: (data) => ({
    subject: `Response to Your Feedback - ${data.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📧 Response to Your Feedback</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your feedback. We have reviewed your submission and would like to respond.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #333; margin-top: 0;">Your Feedback:</h3>
          <p><strong>Reference:</strong> ${data.referenceNumber}</p>
          <p><strong>Type:</strong> ${data.feedbackType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #333; margin-top: 0;">Our Response:</h3>
          <p style="color: #374151; line-height: 1.6;">${data.responseMessage}</p>
        </div>
        <p>We appreciate your time and input. If you have any further questions, please don't hesitate to contact us.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  feedbackStatusUpdate: (data) => ({
    subject: `Feedback Status Update - ${data.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Feedback Status Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your feedback submission with Moksha Sewa.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Reference:</strong> ${data.referenceNumber}</p>
          <p><strong>Type:</strong> ${data.feedbackType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Rating:</strong> ${'⭐'.repeat(data.experienceRating)} (${data.experienceRating}/5)</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'closed' ? '#059669' : data.status === 'responded' ? '#3b82f6' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'reviewed' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Your feedback is being reviewed by our team</p>
          <p style="margin: 5px 0;">• We will respond with any necessary actions or clarifications</p>
          <p style="margin: 5px 0;">• Thank you for your patience during this process</p>
        </div>
        ` : ''}
        ${data.status === 'responded' ? `
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; border: 1px solid #93c5fd;">
          <p style="margin: 0;"><strong>💬 Response Provided:</strong></p>
          <p style="margin: 5px 0;">• We have responded to your feedback</p>
          <p style="margin: 5px 0;">• Please check your email for our detailed response</p>
          <p style="margin: 5px 0;">• Feel free to reach out if you have any follow-up questions</p>
        </div>
        ` : ''}
        ${data.status === 'closed' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>✅ Feedback Closed:</strong></p>
          <p style="margin: 5px 0;">• Your feedback has been processed and closed</p>
          <p style="margin: 5px 0;">• Thank you for helping us improve our services</p>
          <p style="margin: 5px 0;">• Your input is valuable to our continuous improvement</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for taking the time to share your feedback with us.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Volunteer Form Templates
  volunteerWelcome: (data) => ({
    subject: `Welcome to Moksha Sewa Family - ${data.volunteerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🤝 Welcome to Moksha Sewa Family!</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Welcome to the Moksha Sewa volunteer family! Your application has been received and you are now part of our mission to serve humanity.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #333; margin-top: 0;">Volunteer Details:</h3>
          <p><strong>Volunteer ID:</strong> ${data.volunteerId}</p>
          <p><strong>Registration Type:</strong> ${data.registrationType.toUpperCase()}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
          <p><strong>Volunteer Types:</strong> ${data.volunteerTypes ? data.volunteerTypes.join(', ') : 'Not specified'}</p>
        </div>
        <div style="background: #dbeafe; padding: 15px; border-radius: 5px; border: 1px solid #93c5fd;">
          <p style="margin: 0;"><strong>📋 Next Steps:</strong></p>
          <p style="margin: 5px 0;">• Our coordination team will contact you within 2-3 business days</p>
          <p style="margin: 5px 0;">• You will receive training materials and guidelines</p>
          <p style="margin: 5px 0;">• Background verification process will begin</p>
        </div>
        <p style="margin-top: 20px;">Thank you for choosing to serve with us. Together, we make a difference.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  volunteerStatusUpdate: (data) => ({
    subject: `Volunteer Application Status Update - ${data.volunteerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🤝 Volunteer Status Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your volunteer application with Moksha Sewa.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Volunteer ID:</strong> ${data.volunteerId}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.toUpperCase()}</span></p>
        </div>
        ${data.status === 'approved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Congratulations!</strong></p>
          <p style="margin: 5px 0;">• Your volunteer application has been approved!</p>
          <p style="margin: 5px 0;">• Our coordination team will contact you within 2-3 business days</p>
          <p style="margin: 5px 0;">• You will receive training materials and guidelines</p>
          <p style="margin: 5px 0;">• Background verification process will begin</p>
        </div>
        ` : ''}
        ${data.status === 'active' ? `
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; border: 1px solid #93c5fd;">
          <p style="margin: 0;"><strong>🚀 You're Now Active!</strong></p>
          <p style="margin: 5px 0;">• Your volunteer status is now active</p>
          <p style="margin: 5px 0;">• You can start participating in volunteer activities</p>
          <p style="margin: 5px 0;">• Check your email regularly for volunteer opportunities</p>
          <p style="margin: 5px 0;">• Thank you for your commitment to serving humanity</p>
        </div>
        ` : ''}
        ${data.status === 'rejected' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>Application Status</strong></p>
          <p style="margin: 5px 0;">• Unfortunately, we cannot proceed with your application at this time</p>
          ${data.rejectionReason ? `<p style="margin: 5px 0;">• Reason: ${data.rejectionReason}</p>` : ''}
          <p style="margin: 5px 0;">• You may reapply in the future</p>
          <p style="margin: 5px 0;">• Thank you for your interest in volunteering with us</p>
        </div>
        ` : ''}
        ${data.status === 'inactive' ? `
        <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border: 1px solid #d1d5db;">
          <p style="margin: 0;"><strong>Status Changed to Inactive</strong></p>
          <p style="margin: 5px 0;">• Your volunteer status has been set to inactive</p>
          <p style="margin: 5px 0;">• You will not receive new volunteer assignments</p>
          <p style="margin: 5px 0;">• Contact us if you'd like to reactivate your volunteer status</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for your interest in volunteering with Moksha Sewa.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Contact Form Templates
  contactConfirmation: (data) => ({
    subject: `Contact Inquiry Received - ${data.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📞 Contact Inquiry Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for contacting Moksha Sewa. We have received your inquiry and will respond promptly.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="color: #333; margin-top: 0;">Inquiry Details:</h3>
          <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Inquiry Type:</strong> ${data.inquiryType || 'General'}</p>
          <p><strong>Status:</strong> New</p>
        </div>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>⏱️ Response Time:</strong></p>
          <p style="margin: 5px 0;">• We will respond within 24 hours</p>
          <p style="margin: 5px 0;">• For urgent matters, call: <strong>1800-123-456</strong></p>
        </div>
        <p style="margin-top: 20px;">We appreciate your interest in our mission.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  contactResponse: (data) => ({
    subject: `Response to Your Inquiry - ${data.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📧 Response to Your Inquiry</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for contacting us. We have reviewed your inquiry and would like to respond.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="color: #333; margin-top: 0;">Your Inquiry:</h3>
          <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="color: #333; margin-top: 0;">Our Response:</h3>
          <p style="color: #374151; line-height: 1.6;">${data.responseMessage}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to contact us again.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  contactStatusUpdate: (data) => ({
    subject: `Inquiry Status Update - ${data.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Inquiry Status Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your contact inquiry with Moksha Sewa.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6366f1;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'responded' ? '#059669' : data.status === 'closed' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'in_progress' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Your inquiry is being reviewed by our team</p>
          <p style="margin: 5px 0;">• We will respond with detailed information soon</p>
          <p style="margin: 5px 0;">• Expected response within 24-48 hours</p>
        </div>
        ` : ''}
        ${data.status === 'responded' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>✅ Inquiry Responded:</strong></p>
          <p style="margin: 5px 0;">• We have responded to your inquiry</p>
          <p style="margin: 5px 0;">• Thank you for contacting Moksha Sewa</p>
          <p style="margin: 5px 0;">• Feel free to reach out if you need further assistance</p>
        </div>
        ` : ''}
        ${data.status === 'closed' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>📁 Inquiry Closed:</strong></p>
          <p style="margin: 5px 0;">• This inquiry has been closed</p>
          <p style="margin: 5px 0;">• All necessary actions have been completed</p>
          <p style="margin: 5px 0;">• Thank you for your patience</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for contacting Moksha Sewa.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Donation Form Templates
  donationConfirmation: (data) => ({
    subject: `🙏 Donation Request Received - ${data.donationId} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🙏 Thank You! Your Donation Request Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your donation request to Moksha Sewa. Our team will contact you shortly to complete the donation process.</p>
        
        <div style="background: #f0fdfa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #333; margin-top: 0;">Your Donation Details:</h3>
          <p><strong>Donation ID:</strong> ${data.donationId}</p>
          <p><strong>Amount:</strong> ₹${data.amount}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</p>
          <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <div style="background: #fef7ff; padding: 15px; border-radius: 5px; border: 1px solid #d8b4fe;">
          <p style="margin: 0;"><strong>📞 What Happens Next:</strong></p>
          <p style="margin: 5px 0;">• Our team will call you within 24 hours</p>
          <p style="margin: 5px 0;">• We will provide complete payment information</p>
          <p style="margin: 5px 0;">• After payment, you'll receive an 80G tax receipt</p>
          <p style="margin: 5px 0;">• Feel free to contact us with any questions</p>
        </div>
        
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #93c5fd;">
          <p style="margin: 0; color: #1e40af;"><strong>📞 Contact Information:</strong></p>
          <p style="margin: 5px 0;">Phone: ${process.env.ADMIN_PHONE || '+91-XXXXXXXXXX'}</p>
          <p style="margin: 5px 0;">Email: ${process.env.ADMIN_EMAIL || 'info@moksha-seva.org'}</p>
        </div>
        
        <p style="margin-top: 20px;">Your kindness will bring dignity to someone's final journey.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  donationReceiptWithPDF: (data) => ({
    subject: `🙏 Donation Receipt - ${data.receiptNumber} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🙏 Moksha Sewa</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">Dignity in Departure</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #ea580c; margin-bottom: 20px; text-align: center;">Thank You for Your Donation!</h2>
          <p style="font-size: 16px; color: #374151;">Dear ${data.name},</p>
          <p style="color: #6b7280; line-height: 1.6;">Thank you for your generous donation to Moksha Sewa. Your contribution helps us provide dignified services to those in need during their final journey.</p>
          
          <div style="background: linear-gradient(135deg, #fff7ed, #fef3c7); border: 2px solid #fed7aa; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="color: #ea580c; margin-top: 0; font-size: 20px;">📄 Receipt Attached</h3>
            <p style="color: #92400e; margin: 15px 0; font-size: 16px;">Your official donation receipt is attached as a PDF file to this email.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 2px solid #f59e0b;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #fed7aa;">
                  <td style="padding: 8px 0; font-weight: bold; color: #92400e;">Receipt Number:</td>
                  <td style="padding: 8px 0; color: #ea580c; font-weight: bold;">${data.receiptNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7aa;">
                  <td style="padding: 8px 0; font-weight: bold; color: #92400e;">Donation ID:</td>
                  <td style="padding: 8px 0; font-family: monospace;">${data.donationId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7aa;">
                  <td style="padding: 8px 0; font-weight: bold; color: #92400e;">Amount:</td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #059669;">₹${data.amount}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fed7aa;">
                  <td style="padding: 8px 0; font-weight: bold; color: #92400e;">Date:</td>
                  <td style="padding: 8px 0;">${data.createdAt}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #92400e;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                      ${data.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          
          <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin-top: 0; font-size: 16px;">📄 Tax Exemption Information</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #1e40af;">
              <li style="margin: 8px 0;">This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.</li>
              <li style="margin: 8px 0;">Please save the attached PDF receipt for your tax filing purposes.</li>
              <li style="margin: 8px 0;">For tax exemption queries, contact our accounts department.</li>
            </ul>
          </div>
          
          <div style="background: #fef7ff; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center; border: 2px solid #e879f9;">
            <h4 style="color: #a21caf; margin-top: 0;">💾 How to Save Your Receipt</h4>
            <div style="color: #86198f; font-size: 14px; line-height: 1.6;">
              <p style="margin: 8px 0;">📎 <strong>Desktop:</strong> Right-click the PDF attachment and select "Save As"</p>
              <p style="margin: 8px 0;">📱 <strong>Mobile:</strong> Tap the PDF attachment and choose "Download" or "Save to Files"</p>
              <p style="margin: 8px 0;">☁️ <strong>Cloud Storage:</strong> Save to Google Drive, iCloud, or Dropbox for easy access</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Your support enables us to continue our mission of providing dignified cremation services and supporting families in their time of need.</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <div style="margin-bottom: 15px;">
              <h4 style="color: #374151; margin: 0; font-size: 18px;">🙏 Moksha Sewa Foundation</h4>
              <p style="color: #6b7280; margin: 5px 0; font-style: italic;">Liberation Through Service</p>
            </div>
            
            <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              <p style="margin: 5px 0;">📧 Email: info@moksha-seva.org</p>
              <p style="margin: 5px 0;">🌐 Website: www.moksha-seva.org</p>
              <p style="margin: 5px 0;">📞 Phone: [Your Phone Number]</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">This email contains your official donation receipt as a PDF attachment. Generated on ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    `
  }),

  paymentConfirmation: (data) => ({
    subject: `Payment Successful - ${data.donationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">✅ Payment Successful!</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Your payment has been successfully processed. Thank you for your generous donation to Moksha Sewa.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
          <p><strong>Donation ID:</strong> ${data.donationId}</p>
          <p><strong>Payment ID:</strong> ${data.paymentId}</p>
          <p><strong>Amount:</strong> ₹${data.amount}</p>
          <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="background: #fef7ff; padding: 15px; border-radius: 5px; border: 1px solid #d8b4fe;">
          <p style="margin: 0;"><strong>📄 Next Steps:</strong></p>
          <p style="margin: 5px 0;">• Your official 80G tax receipt will be emailed within 24 hours</p>
          <p style="margin: 5px 0;">• You will receive updates about how your donation is being used</p>
          <p style="margin: 5px 0;">• Thank you for supporting our mission of dignity</p>
        </div>
        <p style="margin-top: 20px;">Your contribution makes a real difference in providing dignified services to those in need.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Task Management Templates
  taskAssignment: (data) => ({
    subject: `🎯 New Task Assignment - ${data.taskId} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎯 Task Assignment</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">Moksha Sewa - Volunteer Task</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #1d4ed8; margin-bottom: 20px;">Hello ${data.volunteerName}!</h2>
          <p style="color: #374151; line-height: 1.6;">You have been assigned a new task. Please review the details below and respond accordingly.</p>
          
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px solid #93c5fd; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 20px;">📋 Task Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Task ID:</td>
                <td style="padding: 12px 0; font-family: monospace;">${data.taskId}</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Title:</td>
                <td style="padding: 12px 0; font-weight: bold;">${data.taskTitle}</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Category:</td>
                <td style="padding: 12px 0;">${data.category}</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Priority:</td>
                <td style="padding: 12px 0;">
                  <span style="background: ${data.priority === 'URGENT' ? '#fecaca' : data.priority === 'HIGH' ? '#fed7aa' : data.priority === 'MEDIUM' ? '#fef3c7' : '#d1fae5'}; color: ${data.priority === 'URGENT' ? '#dc2626' : data.priority === 'HIGH' ? '#ea580c' : data.priority === 'MEDIUM' ? '#d97706' : '#059669'}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${data.priority}
                  </span>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Due Date:</td>
                <td style="padding: 12px 0; color: #dc2626; font-weight: bold;">${data.dueDate}</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Duration:</td>
                <td style="padding: 12px 0;">${data.estimatedDuration} hour(s)</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Location:</td>
                <td style="padding: 12px 0;">${data.location}</td>
              </tr>
              <tr style="border-bottom: 1px solid #93c5fd;">
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Contact:</td>
                <td style="padding: 12px 0;">${data.contactPerson}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; color: #1e40af;">Requirements:</td>
                <td style="padding: 12px 0;">${data.requirements}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #374151; margin-top: 0;">📝 Task Description:</h4>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">${data.taskDescription}</p>
          </div>
          
          <div style="background: #fef7ff; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #a855f7;">
            <h4 style="color: #7c3aed; margin-top: 0;">⚠️ Important Notes:</h4>
            <ul style="color: #7c3aed; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Please respond within 2 hours of receiving this email</li>
              <li style="margin: 8px 0;">If you accept, you commit to completing the task by the due date</li>
              <li style="margin: 8px 0;">Contact the admin immediately if you have any questions</li>
              <li style="margin: 8px 0;">Your response helps us serve families in need efficiently</li>
            </ul>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0; font-size: 18px;">🙏 Moksha Sewa Foundation</h4>
            <p style="color: #6b7280; margin: 5px 0; font-style: italic;">Liberation Through Service</p>
            <div style="color: #6b7280; font-size: 14px; margin-top: 15px;">
              <p>📧 Email: volunteer@moksha-seva.org | 📞 Phone: [Support Number]</p>
            </div>
          </div>
        </div>
      </div>
    `
  }),

  taskAccepted: (data) => ({
    subject: `✅ Task Accepted - ${data.taskId} - Thank You!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">✅ Task Accepted</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for your commitment!</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #059669;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Thank you for accepting the task assignment. Your commitment to serving others is truly appreciated.</p>
          
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="color: #166534; margin-top: 0;">📋 Accepted Task</h3>
            <p style="font-size: 18px; font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Accepted on: ${data.acceptedAt}</p>
          </div>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📞 Next Steps:</h4>
            <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">You will receive detailed instructions shortly</li>
              <li style="margin: 8px 0;">Contact information will be provided if needed</li>
              <li style="margin: 8px 0;">Please arrive on time and prepared</li>
              <li style="margin: 8px 0;">Update us on task completion</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-style: italic;">"Your service brings comfort to families in their time of need."</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0;">🙏 Moksha Sewa Team</h4>
            <p style="color: #6b7280; margin: 5px 0;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  }),

  taskRejected: (data) => ({
    subject: `❌ Task Declined - ${data.taskId} - Thank You for Responding`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📝 Task Response Received</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for your prompt response</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #d97706;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Thank you for responding to the task assignment. We understand that you cannot take on this task at this time.</p>
          
          <div style="background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Declined Task</h3>
            <p style="font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Reason: ${data.rejectionReason}</p>
          </div>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">💙 No Worries!</h4>
            <p style="color: #1e40af; margin: 0;">We appreciate your honesty and prompt response. There will be other opportunities to serve, and we look forward to working with you in the future.</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0;">🙏 Moksha Sewa Team</h4>
            <p style="color: #6b7280; margin: 5px 0;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  }),

  taskCompleted: (data) => ({
    subject: `🎉 Task Completed - ${data.taskId} - Excellent Work!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Task Completed!</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Excellent work, volunteer!</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #7c3aed;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Congratulations on successfully completing your assigned task! Your dedication and service make a real difference in people's lives.</p>
          
          <div style="background: #faf5ff; border: 2px solid #c4b5fd; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="color: #6d28d9; margin-top: 0;">✅ Completed Task</h3>
            <p style="font-size: 18px; font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Completed on: ${data.completedAt}</p>
          </div>
          
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h4 style="color: #166534; margin-top: 0;">🙏 Thank You!</h4>
            <p style="color: #166534; margin: 0; font-style: italic;">"Your compassionate service brings dignity and comfort to families during their most difficult moments. You are truly making a difference."</p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0;">🙏 Moksha Sewa Team</h4>
            <p style="color: #6b7280; margin: 5px 0;">Liberation Through Service</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 15px;">Your service record has been updated. Thank you for being part of our mission.</p>
          </div>
        </div>
      </div>
    `
  }),

  // Admin Notification Templates
  taskAcceptedAdmin: (data) => ({
    subject: `✅ Task Accepted by Volunteer - ${data.taskId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Task Accepted</h2>
        <p>Dear ${data.adminName},</p>
        <p>Good news! A volunteer has accepted the task assignment.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Volunteer:</strong> ${data.volunteerName}</p>
          <p><strong>Task:</strong> ${data.taskTitle}</p>
          <p><strong>Task ID:</strong> ${data.taskId}</p>
        </div>
        <p>The volunteer is now committed to completing this task. You can track progress in the admin dashboard.</p>
        <p><strong>Moksha Sewa Admin Team</strong></p>
      </div>
    `
  }),

  taskRejectedAdmin: (data) => ({
    subject: `❌ Task Rejected by Volunteer - ${data.taskId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">❌ Task Rejected</h2>
        <p>Dear ${data.adminName},</p>
        <p>A volunteer has declined the task assignment.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Volunteer:</strong> ${data.volunteerName}</p>
          <p><strong>Task:</strong> ${data.taskTitle}</p>
          <p><strong>Task ID:</strong> ${data.taskId}</p>
          <p><strong>Reason:</strong> ${data.rejectionReason}</p>
        </div>
        <p>You may need to assign this task to another volunteer or handle it differently.</p>
        <p><strong>Moksha Sewa Admin Team</strong></p>
      </div>
    `
  }),

  taskCompletedAdmin: (data) => ({
    subject: `🎉 Task Completed by Volunteer - ${data.taskId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8b5cf6;">🎉 Task Completed</h2>
        <p>Dear ${data.adminName},</p>
        <p>Excellent news! A volunteer has successfully completed their assigned task.</p>
        <div style="background: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Volunteer:</strong> ${data.volunteerName}</p>
          <p><strong>Task:</strong> ${data.taskTitle}</p>
          <p><strong>Task ID:</strong> ${data.taskId}</p>
          ${data.completionNotes ? `<p><strong>Notes:</strong> ${data.completionNotes}</p>` : ''}
          ${data.rating ? `<p><strong>Rating:</strong> ${data.rating}/5 stars</p>` : ''}
        </div>
        <p>The task has been marked as completed. You can review the details in the admin dashboard.</p>
        <p><strong>Moksha Sewa Admin Team</strong></p>
      </div>
    `
  }),
  boardApplicationConfirmation: (data) => ({
    subject: `Board Application Received - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">👔 Board Application Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your interest in joining the Moksha Sewa Board. Your application has been received and is under review.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e40af;">
          <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Position:</strong> ${data.positionInterested.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 Selection Process:</strong></p>
          <p style="margin: 5px 0;">• Application review (2-3 weeks)</p>
          <p style="margin: 5px 0;">• Interview scheduling (if shortlisted)</p>
          <p style="margin: 5px 0;">• Final decision notification</p>
        </div>
        <p style="margin-top: 20px;">We appreciate your commitment to our mission.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  boardApplicationStatusUpdate: (data) => ({
    subject: `Board Application Status Update - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Application Status Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your board application with Moksha Sewa.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e40af;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Position:</strong> ${data.positionInterested.replace('_', ' ').toUpperCase()}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'under_review' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Your application is being reviewed by our selection committee</p>
          <p style="margin: 5px 0;">• We will contact you within 2-3 weeks with the next steps</p>
          <p style="margin: 5px 0;">• Thank you for your patience during this process</p>
        </div>
        ` : ''}
        ${data.status === 'interview_scheduled' ? `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border: 1px solid #7dd3fc;">
          <p style="margin: 0;"><strong>🎯 Interview Scheduled:</strong></p>
          <p style="margin: 5px 0;">• Congratulations! You have been shortlisted for an interview</p>
          <p style="margin: 5px 0;">• Our team will contact you soon to schedule the interview</p>
          <p style="margin: 5px 0;">• Please prepare to discuss your experience and vision for Moksha Sewa</p>
        </div>
        ` : ''}
        ${data.status === 'approved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Congratulations!</strong></p>
          <p style="margin: 5px 0;">• Your application has been approved!</p>
          <p style="margin: 5px 0;">• Welcome to the Moksha Sewa Board of Advisors</p>
          <p style="margin: 5px 0;">• Our team will contact you with onboarding details</p>
        </div>
        ` : ''}
        ${data.status === 'rejected' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>Thank you for your interest</strong></p>
          <p style="margin: 5px 0;">• While we cannot move forward with your application at this time</p>
          <p style="margin: 5px 0;">• We encourage you to apply again in the future</p>
          <p style="margin: 5px 0;">• Consider volunteering with us in other capacities</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for your interest in serving with Moksha Sewa.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Legacy Giving Templates
  legacyGivingConfirmation: (data) => ({
    subject: `Legacy Giving Information Request - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🌟 Legacy Giving Request</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for considering a legacy gift to Moksha Sewa. Your thoughtful planning will create a lasting impact for generations.</p>
        <div style="background: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p><strong>Legacy Type:</strong> ${data.legacyType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Timeframe:</strong> ${data.timeframe || 'Not specified'}</p>
        </div>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border: 1px solid #7dd3fc;">
          <p style="margin: 0;"><strong>📞 Next Steps:</strong></p>
          <p style="margin: 5px 0;">• Our legacy giving specialist will contact you</p>
          <p style="margin: 5px 0;">• Confidential consultation at your convenience</p>
          <p style="margin: 5px 0;">• Information packet will be sent</p>
        </div>
        <p style="margin-top: 20px;">Your legacy will help ensure dignified farewells for generations to come.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  legacyGivingStatusUpdate: (data) => ({
    subject: `Legacy Giving Status Update - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Legacy Giving Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your legacy giving request with Moksha Sewa.</p>
        <div style="background: #faf5ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p><strong>Legacy Type:</strong> ${data.legacyType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Timeframe:</strong> ${data.timeframe || 'Not specified'}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'completed' ? '#059669' : data.status === 'declined' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'contacted' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📞 We've Reached Out:</strong></p>
          <p style="margin: 5px 0;">• Our legacy giving specialist has contacted you</p>
          <p style="margin: 5px 0;">• Please check your phone and email for our communication</p>
          <p style="margin: 5px 0;">• We look forward to discussing your legacy plans</p>
        </div>
        ` : ''}
        ${data.status === 'in_discussion' ? `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border: 1px solid #7dd3fc;">
          <p style="margin: 0;"><strong>💬 Discussion in Progress:</strong></p>
          <p style="margin: 5px 0;">• We are actively discussing your legacy giving options</p>
          <p style="margin: 5px 0;">• Our specialist will guide you through the process</p>
          <p style="margin: 5px 0;">• Take your time to consider all options</p>
        </div>
        ` : ''}
        ${data.status === 'completed' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Legacy Plan Completed:</strong></p>
          <p style="margin: 5px 0;">• Your legacy giving plan has been finalized</p>
          <p style="margin: 5px 0;">• Thank you for choosing to create a lasting impact</p>
          <p style="margin: 5px 0;">• Your legacy will help countless families in their time of need</p>
        </div>
        ` : ''}
        ${data.status === 'declined' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>Thank you for considering us</strong></p>
          <p style="margin: 5px 0;">• We understand that legacy planning is a personal decision</p>
          <p style="margin: 5px 0;">• You are always welcome to reconsider in the future</p>
          <p style="margin: 5px 0;">• Thank you for your interest in Moksha Sewa's mission</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for considering Moksha Sewa for your legacy giving.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Government Scheme Templates
  schemeApplicationConfirmation: (data) => ({
    subject: `Government Scheme Application - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🏛️ Scheme Application Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Your government scheme application has been received and is being processed by our team.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Scheme:</strong> ${data.schemeName}</p>
          <p><strong>Type:</strong> ${data.schemeType.toUpperCase()}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
        <div style="background: #fffbeb; padding: 15px; border-radius: 5px; border: 1px solid #fbbf24;">
          <p style="margin: 0;"><strong>⏳ Processing Time:</strong></p>
          <p style="margin: 5px 0;">• Document verification: 3-5 business days</p>
          <p style="margin: 5px 0;">• Application review: 1-2 weeks</p>
          <p style="margin: 5px 0;">• Final decision: 2-4 weeks</p>
        </div>
        <p style="margin-top: 20px;">We will keep you updated on the progress.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  schemeApplicationStatusUpdate: (data) => ({
    subject: `Scheme Application Status Update - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Application Status Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your government scheme application.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Application ID:</strong> ${data.applicationId}</p>
          <p><strong>Scheme:</strong> ${data.schemeName}</p>
          <p><strong>Type:</strong> ${data.schemeType.toUpperCase()}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'under_review' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Your application is being reviewed by our team</p>
          <p style="margin: 5px 0;">• We will contact you if additional documents are needed</p>
          <p style="margin: 5px 0;">• Expected decision within 1-2 weeks</p>
        </div>
        ` : ''}
        ${data.status === 'approved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Congratulations!</strong></p>
          <p style="margin: 5px 0;">• Your scheme application has been approved!</p>
          <p style="margin: 5px 0;">• You will receive further instructions for benefit disbursement</p>
          <p style="margin: 5px 0;">• Keep your application ID for future reference</p>
        </div>
        ` : ''}
        ${data.status === 'rejected' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>Application Status</strong></p>
          <p style="margin: 5px 0;">• Unfortunately, your application could not be approved at this time</p>
          <p style="margin: 5px 0;">• You may reapply after addressing the requirements</p>
          <p style="margin: 5px 0;">• Contact us for clarification on eligibility criteria</p>
        </div>
        ` : ''}
        ${data.status === 'pending_documents' ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 5px; border: 1px solid #fbbf24;">
          <p style="margin: 0;"><strong>📄 Documents Required:</strong></p>
          <p style="margin: 5px 0;">• Additional documents are needed to process your application</p>
          <p style="margin: 5px 0;">• Our team will contact you with the specific requirements</p>
          <p style="margin: 5px 0;">• Please submit the documents within 15 days</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for using our scheme assistance service.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Expansion Request Templates
  expansionRequestConfirmation: (data) => ({
    subject: `Expansion Request Received - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #0e7490); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🌍 Expansion Request Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your request to expand Moksha Sewa services to ${data.requestedCity}, ${data.requestedState}. We appreciate your initiative.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0891b2;">
          <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p><strong>Location:</strong> ${data.requestedCity}, ${data.requestedState}</p>
          <p><strong>Status:</strong> ${data.status.toUpperCase()}</p>
        </div>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>📊 Evaluation Process:</strong></p>
          <p style="margin: 5px 0;">• Feasibility study and assessment</p>
          <p style="margin: 5px 0;">• Local partnership evaluation</p>
          <p style="margin: 5px 0;">• Resource requirement analysis</p>
          <p style="margin: 5px 0;">• Final decision within 4-6 weeks</p>
        </div>
        <p style="margin-top: 20px;">Your vision helps us reach more communities in need.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Admin Notification Templates
  reportAdminNotification: (data) => ({
    subject: `🚨 URGENT: New Report Submitted - ${data.caseNumber}`,
    html: emailTemplates.wrapAdminTemplate(
      '🚨 Urgent Case Report',
      `Reference: ${data.caseNumber}`,
      `
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
          <h3 style="margin: 0; color: #991b1b; font-size: 16px;">Immediate Action Required</h3>
          <p style="margin: 5px 0 0 0; color: #b91c1c; font-size: 14px;">A new case has been reported at ${data.area}, ${data.city}.</p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 140px; color: #64748b; font-size: 13px; font-weight: bold;">REPORTER:</td><td style="color: #1e293b; font-weight: 600;">${data.reporterName || 'Anonymous'}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CONTACT:</td><td style="color: #1e293b; font-weight: 600;">${data.reporterPhone || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">EMAIL:</td><td style="color: #1e293b;">${data.reporterEmail || 'N/A'}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">LOCATION:</td><td style="color: #1e293b;">${data.exactLocation}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CITY/STATE:</td><td style="color: #1e293b;">${data.city}, ${data.state || ''}</td></tr>
        </table>
      `,
      '#dc2626'
    )
  }),

  donationAdminNotification: (data) => ({
    subject: `💰 New Donation Request - ₹${data.amount} - ${data.donorName}`,
    html: emailTemplates.wrapAdminTemplate(
      '💰 Donation Received',
      `ID: ${data.donationId}`,
      `
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; border-radius: 4px; text-align: center;">
          <h2 style="margin: 0; color: #059669; font-size: 28px;">₹${data.amount}</h2>
          <p style="margin: 5px 0 0 0; color: #065f46; font-size: 14px; font-weight: 600;">via ${data.paymentMethod.toUpperCase()}</p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
          <tr><td style="width: 130px; color: #64748b; font-size: 13px; font-weight: bold;">DONOR:</td><td style="color: #1e293b; font-weight: 600; font-size: 16px;">${data.donorName}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CONTACT:</td><td style="color: #1e293b; font-weight: 600;">${data.phone}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">EMAIL:</td><td style="color: #1e293b;">${data.email}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">LOCATION:</td><td style="color: #1e293b;">${data.city}, ${data.state}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">PURPOSE:</td><td style="color: #1e293b; font-weight: 600;">${data.purpose || 'General'}</td></tr>
        </table>
        
        ${data.message ? `<div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-style: italic;">"${data.message}"</div>` : ''}
      `,
      '#059669'
    )
  }),

  volunteerAdminNotification: (data) => ({
    subject: `🤝 NEW VOLUNTEER: ${data.name} - ${data.city}`,
    html: emailTemplates.wrapAdminTemplate(
      '🌟 New Volunteer Enrolled',
      `Application Reference: MS-V-${data.volunteerId.toString().slice(-6).toUpperCase()}`,
      `
        <div style="background-color: #f0f7ff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid #bfdbfe;">
           <p style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 12px; font-weight: 800; text-transform: uppercase;">Application Insight</p>
           <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
             A new candidate has expressed interest in joining the Moksha mission. Below are the verified details from the <span style="font-weight: bold;">Multi-Step Onboarding System</span>.
           </p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
          <tr>
            <td style="width: 150px; color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Full Name</td>
            <td style="color: #0f172a; font-size: 15px; font-weight: 700;">${data.name}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Primary Contact</td>
            <td style="color: #0f172a; font-size: 15px; font-weight: 700;">${data.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Secure Email</td>
            <td style="color: #000080; font-size: 15px; font-weight: 600; text-decoration: underline;">${data.email || 'N/A'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Operating Zone</td>
            <td style="color: #0f172a; font-size: 15px;">${data.city}, ${data.state}</td>
          </tr>
          <tr>
             <td colspan="2" style="padding: 10px 0;">
                <div style="height: 1px; background: #f1f5f9;"></div>
             </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Specialization</td>
            <td style="color: #0f172a; font-size: 14px;">
              ${data.volunteerTypes ? data.volunteerTypes.map(t => `<span style="background: #000080; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${t}</span>`).join('') : data.registrationType}
            </td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Current Occupation</td>
            <td style="color: #0f172a; font-size: 14px;">${data.occupation || 'N/A'}</td>
          </tr>
          <tr>
            <td style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">Identified Skills</td>
            <td style="color: #0f172a; font-size: 14px; font-style: italic;">"${data.skills || 'Self-motivated volunteer'}"</td>
          </tr>
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.ADMIN_URL || 'http://localhost:3000'}/admin/volunteers" style="background-color: #000080; color: #f4c430; padding: 16px 32px; border-radius: 12px; font-weight: 800; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0, 0, 128, 0.2);">
            REVIEW APPLICATION IN DASHBOARD
          </a>
        </div>
      `,
      '#000080'
    )
  }),

  contactAdminNotification: (data) => ({
    subject: `📞 New Contact Inquiry - ${data.ticketNumber}`,
    html: emailTemplates.wrapAdminTemplate(
      '📞 New Inquiry',
      `Ticket: ${data.ticketNumber}`,
      `
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
          <p style="margin: 0; color: #1e293b; font-weight: 700; font-size: 16px;">Subject: ${data.subject}</p>
          <p style="margin: 10px 0 0 0; color: #475569; font-style: italic; line-height: 1.6;">"${data.message}"</p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 130px; color: #64748b; font-size: 13px; font-weight: bold;">FROM:</td><td style="color: #1e293b; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">PHONE:</td><td style="color: #1e293b;">${data.phone || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">EMAIL:</td><td style="color: #1e293b;">${data.email || 'N/A'}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">DEPARTMENT:</td><td style="color: #1e293b; text-transform: uppercase; font-size: 12px; font-weight: 700; color: #6366f1;">${data.inquiryType || 'General'}</td></tr>
        </table>
      `,
      '#6366f1'
    )
  }),

  boardApplicationAdminNotification: (data) => ({
    subject: `👔 New Board Application - ${data.applicantName}`,
    html: emailTemplates.wrapAdminTemplate(
      '👔 Board Application',
      `ID: ${data.applicationId}`,
      `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 150px; color: #64748b; font-size: 13px; font-weight: bold;">APPLICANT:</td><td style="color: #1e293b; font-weight: 600;">${data.applicantName}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">POSITION:</td><td style="color: #1e3a8a; font-weight: 700;">${data.positionInterested}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">EXPERIENCE:</td><td style="color: #1e293b;">${data.experience} Years</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">ORGANIZATION:</td><td style="color: #1e293b;">${data.organization || 'N/A'}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CONTACT:</td><td style="color: #1e293b;">${data.phone} / ${data.email}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">MOTIVATION:</p>
          <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 13px; font-style: italic;">"${data.motivationStatement}"</p>
        </div>
      `,
      '#1e3a8a'
    )
  }),

  legacyGivingAdminNotification: (data) => ({
    subject: `🌟 New Legacy Giving - ${data.requesterName}`,
    html: emailTemplates.wrapAdminTemplate(
      '🌟 Legacy Giving',
      `ID: ${data.requestId}`,
      `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 150px; color: #64748b; font-size: 13px; font-weight: bold;">REQUESTER:</td><td style="color: #1e293b; font-weight: 600;">${data.requesterName}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">LEGACY TYPE:</td><td style="color: #7c3aed; font-weight: 700;">${data.legacyType}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">EST. VALUE:</td><td style="color: #1e293b;">${data.estimatedValue}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">TIMEFRAME:</td><td style="color: #1e293b;">${data.timeframe}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CONTACT:</td><td style="color: #1e293b;">${data.phone} / ${data.email}</td></tr>
        </table>
      `,
      '#7c3aed'
    )
  }),

  schemeApplicationAdminNotification: (data) => ({
    subject: `🏛️ New Scheme Application - ${data.name}`,
    html: emailTemplates.wrapAdminTemplate(
      '🏛️ Gov Scheme App',
      `ID: ${data.applicationId}`,
      `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 140px; color: #64748b; font-size: 13px; font-weight: bold;">APPLICANT:</td><td style="color: #1e293b; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">SCHEME:</td><td style="color: #dc2626; font-weight: 700;">${data.schemeName}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">TYPE:</td><td style="color: #1e293b;">${data.schemeType}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CATEGORY:</td><td style="color: #1e293b;">${data.incomeCategory}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">CONTACT:</td><td style="color: #1e293b;">${data.phone} / ${data.email}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">LOCATION:</td><td style="color: #1e293b;">${data.city}, ${data.state}</td></tr>
        </table>
      `,
      '#dc2626'
    )
  }),

  expansionRequestAdminNotification: (data) => ({
    subject: `🌍 Expansion Request - ${data.requestedCity}`,
    html: emailTemplates.wrapAdminTemplate(
      '🌍 Expansion Intent',
      `ID: ${data.requestId}`,
      `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 140px; color: #64748b; font-size: 13px; font-weight: bold;">REQUESTER:</td><td style="color: #1e293b; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">HUB LOCATION:</td><td style="color: #0891b2; font-weight: 700;">${data.requestedCity}, ${data.requestedState}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">URGENCY:</td><td style="color: #1e293b;">${data.urgencyLevel}</td></tr>
          <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 10px 0;"></td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">ORGANIZATION:</td><td style="color: #1e293b;">${data.organization || 'Individual'}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #e0f2fe;">
          <p style="margin: 0; color: #0891b2; font-size: 11px; font-weight: bold; text-transform: uppercase;">RATIONALE:</p>
          <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 13px; line-height: 1.5;">${data.whyNeeded}</p>
        </div>
      `,
      '#0891b2'
    )
  }),

  feedbackAdminNotification: (data) => ({
    subject: `💚 New Feedback - ${data.experienceRating}⭐`,
    html: emailTemplates.wrapAdminTemplate(
      '💚 User Feedback',
      'Quality Control System',
      `
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="font-size: 32px; color: #10b981;">${'⭐'.repeat(data.experienceRating)}</div>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px; font-weight: bold;">RATING: ${data.experienceRating}/5</p>
        </div>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
          <tr><td style="width: 130px; color: #64748b; font-size: 13px; font-weight: bold;">FROM:</td><td style="color: #1e293b; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="color: #64748b; font-size: 13px; font-weight: bold;">TYPE:</td><td style="color: #1e293b; text-transform: capitalize;">${data.feedbackType}</td></tr>
        </table>
        
        <div style="margin-top: 20px; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #d1fae5; color: #065f46; font-style: italic;">
          "${data.message}"
        </div>
      `,
      '#10b981'
    )
  }),

  newsletterAdminNotification: (data) => ({
    subject: `📩 New Newsletter Subscriber - ${data.email}`,
    html: module.exports.wrapAdminTemplate(
      '📩 New Subscription',
      'Mailing List Update',
      `
        <div style="text-align: center; padding: 20px 0;">
          <div style="font-size: 48px; margin-bottom: 20px;">💌</div>
          <p style="color: #64748b; font-size: 16px; margin: 0;">New audience member joined:</p>
          <h2 style="color: #1e3a8a; font-size: 24px; margin: 15px 0;">${data.email}</h2>
          <div style="display: inline-block; background-color: #eff6ff; color: #2563eb; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;">
            SOURCE: ${data.source || 'Website'}
          </div>
        </div>
      `,
      '#6366f1'
    )
  }),

  expansionRequestStatusUpdate: (data) => ({
    subject: `Expansion Request Status Update - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #0e7490); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Expansion Request Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your expansion request for Moksha Sewa services.</p>
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0891b2;">
          <h3 style="color: #333; margin-top: 0;">Status Update:</h3>
          <p><strong>Request ID:</strong> ${data.requestId}</p>
          <p><strong>Location:</strong> ${data.requestedCity}, ${data.requestedState}</p>
          <p><strong>New Status:</strong> <span style="color: ${data.status === 'approved' ? '#059669' : data.status === 'rejected' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${data.status.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        ${data.status === 'under_review' ? `
        <div style="background: #fefce8; padding: 15px; border-radius: 5px; border: 1px solid #fde047;">
          <p style="margin: 0;"><strong>📋 What's Next:</strong></p>
          <p style="margin: 5px 0;">• Your request is being reviewed by our expansion team</p>
          <p style="margin: 5px 0;">• We are conducting a feasibility study for your location</p>
          <p style="margin: 5px 0;">• Expected decision within 4-6 weeks</p>
        </div>
        ` : ''}
        ${data.status === 'feasibility_study' ? `
        <div style="background: #f0f9ff; padding: 15px; border-radius: 5px; border: 1px solid #7dd3fc;">
          <p style="margin: 0;"><strong>📊 Feasibility Study:</strong></p>
          <p style="margin: 5px 0;">• We are conducting a detailed feasibility study</p>
          <p style="margin: 5px 0;">• Assessing local partnerships and resource requirements</p>
          <p style="margin: 5px 0;">• This process may take 2-4 weeks to complete</p>
        </div>
        ` : ''}
        ${data.status === 'approved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Congratulations!</strong></p>
          <p style="margin: 5px 0;">• Your expansion request has been approved!</p>
          <p style="margin: 5px 0;">• Our team will begin the setup process in your city</p>
          <p style="margin: 5px 0;">• You will be contacted for next steps and partnership details</p>
        </div>
        ` : ''}
        ${data.status === 'rejected' ? `
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; border: 1px solid #fca5a5;">
          <p style="margin: 0;"><strong>Request Status</strong></p>
          <p style="margin: 5px 0;">• Unfortunately, we cannot proceed with expansion at this time</p>
          <p style="margin: 5px 0;">• This may be due to resource constraints or feasibility factors</p>
          <p style="margin: 5px 0;">• You may reapply in the future when circumstances change</p>
        </div>
        ` : ''}
        ${data.status === 'on_hold' ? `
        <div style="background: #fffbeb; padding: 15px; border-radius: 5px; border: 1px solid #fbbf24;">
          <p style="margin: 0;"><strong>⏸️ Request On Hold:</strong></p>
          <p style="margin: 5px 0;">• Your request is temporarily on hold</p>
          <p style="margin: 5px 0;">• We will resume evaluation when resources become available</p>
          <p style="margin: 5px 0;">• Thank you for your patience during this time</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for your interest in expanding Moksha Sewa's reach.</p>
        <p><strong>Moksha Sewa Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Authentication Email Templates
  adminWelcome: (data) => ({
    subject: `Welcome to Moksha Sewa Admin Panel - ${data.role.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔐 Welcome to Moksha Sewa Admin Panel</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Welcome to the Moksha Sewa Admin Panel! Your account has been created successfully.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #1e40af;">
          <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Role:</strong> ${data.role.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Temporary Password:</strong> ${data.tempPassword}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; border: 1px solid #fbbf24;">
          <p style="margin: 0;"><strong>⚠️ Important Security Steps:</strong></p>
          <p style="margin: 5px 0;">• Change your password immediately after first login</p>
          <p style="margin: 5px 0;">• Enable two-factor authentication for added security</p>
          <p style="margin: 5px 0;">• Only access the panel from authorized IP addresses</p>
        </div>
        <p style="margin-top: 20px;">Thank you for joining our mission to serve humanity with dignity.</p>
        <p><strong>Moksha Sewa Admin Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: `Password Reset Request - Moksha Sewa Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔒 Password Reset Request</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>You have requested to reset your password for your Moksha Sewa Admin account.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #333; margin-top: 0;">Reset Instructions:</h3>
          <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${data.resetUrl}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p><small>If the button doesn't work, copy and paste this link: ${data.resetUrl}</small></p>
        </div>
        <div style="background: #fffbeb; padding: 15px; border-radius: 5px; border: 1px solid #fbbf24;">
          <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
          <p style="margin: 5px 0;">• If you didn't request this reset, please ignore this email</p>
          <p style="margin: 5px 0;">• Never share your password or reset links with anyone</p>
          <p style="margin: 5px 0;">• Contact support if you suspect unauthorized access</p>
        </div>
        <p style="margin-top: 20px;">Stay secure!</p>
        <p><strong>Moksha Sewa Security Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Assignment Approval Templates
  assignmentApproved: (data) => ({
    subject: `✅ Assignment Approved - ${data.taskId} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">✅ Assignment Approved</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Your task assignment has been approved!</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #059669;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Great news! Your assignment for the following task has been approved by our admin team.</p>
          
          <div style="background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="color: #166534; margin-top: 0;">📋 Approved Task</h3>
            <p style="font-size: 18px; font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Approved on: ${data.approvedAt}</p>
          </div>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">📞 Next Steps:</h4>
            <ul style="color: #1e40af; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">You can now proceed with the task as planned</li>
              <li style="margin: 8px 0;">Contact the provided contact person for coordination</li>
              <li style="margin: 8px 0;">Update your progress through the volunteer portal</li>
              <li style="margin: 8px 0;">Mark the task as completed once finished</li>
            </ul>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0; font-size: 18px;">🙏 Moksha Sewa Foundation</h4>
            <p style="color: #6b7280; margin: 5px 0; font-style: italic;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  }),

  assignmentRejected: (data) => ({
    subject: `❌ Assignment Update - ${data.taskId} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">📋 Assignment Update</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Regarding your task assignment</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #374151;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Thank you for your willingness to serve. Unfortunately, your assignment for the following task could not be approved at this time.</p>
          
          <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">📋 Task Details</h3>
            <p style="font-size: 18px; font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Decision Date: ${data.rejectedAt}</p>
            ${data.rejectionReason ? `<p style="color: #dc2626; margin-top: 15px;"><strong>Reason:</strong> ${data.rejectionReason}</p>` : ''}
          </div>
          
          <div style="background: #fffbeb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #d97706; margin-top: 0;">💡 What's Next:</h4>
            <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">This doesn't affect your volunteer status</li>
              <li style="margin: 8px 0;">You'll be considered for future suitable tasks</li>
              <li style="margin: 8px 0;">Feel free to contact us if you have questions</li>
              <li style="margin: 8px 0;">Thank you for your continued support</li>
            </ul>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0; font-size: 18px;">🙏 Moksha Sewa Foundation</h4>
            <p style="color: #6b7280; margin: 5px 0; font-style: italic;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  }),

  // Completion Certificate Template
  completionCertificate: (data) => ({
    subject: `🏆 Certificate of Appreciation - ${data.taskId} - Moksha Sewa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🏆 Certificate of Appreciation</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Your service has been recognized!</p>
        </div>
        
        <div style="padding: 0 10px;">
          <h2 style="color: #7c3aed;">Dear ${data.volunteerName},</h2>
          <p style="color: #374151; line-height: 1.6;">Congratulations! You have successfully completed your volunteer service. As a token of our appreciation, we have generated a certificate recognizing your valuable contribution.</p>
          
          <div style="background: linear-gradient(135deg, #faf5ff, #f3e8ff); border: 2px solid #c4b5fd; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <h3 style="color: #6d28d9; margin-top: 0;">🎖️ Service Completed</h3>
            <p style="font-size: 18px; font-weight: bold; color: #374151; margin: 10px 0;">${data.taskTitle}</p>
            <p style="color: #6b7280;">Task ID: ${data.taskId}</p>
            <p style="color: #6b7280;">Completed on: ${data.completedDate}</p>
          </div>
          
          <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #0369a1; margin-top: 0;">📎 Certificate Attached</h4>
            <p style="color: #0369a1; margin: 10px 0;">Your personalized Certificate of Appreciation is attached to this email as a PDF document. You can:</p>
            <ul style="color: #0369a1; margin: 10px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Download and save it for your records</li>
              <li style="margin: 8px 0;">Print it for display</li>
              <li style="margin: 8px 0;">Share it on social media to inspire others</li>
              <li style="margin: 8px 0;">Add it to your volunteer portfolio</li>
            </ul>
          </div>
          
          <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h4 style="color: #059669; margin-top: 0;">🌟 Thank You for Your Service</h4>
            <p style="color: #065f46; line-height: 1.6; margin: 0;">
              Your compassionate service has made a real difference in someone's life. 
              Through your dedication, you have helped families during their most difficult times 
              and embodied the true spirit of humanity. We are honored to have you as part of 
              the Moksha Sewa family.
            </p>
          </div>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 30px; text-align: center;">
            <h4 style="color: #374151; margin: 0; font-size: 18px;">🙏 Moksha Sewa Foundation</h4>
            <p style="color: #6b7280; margin: 5px 0; font-style: italic;">Liberation Through Service</p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 15px;">
              Continue making a difference. Check our volunteer portal for more opportunities to serve.
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function with enhanced error handling
const sendEmail = async (to, template, data, attachment = null) => {
  try {
    console.log(`📧 Starting email send process...`);
    console.log(`📧 To: ${to}`);
    console.log(`📧 Template: ${template}`);
    console.log(`📧 Environment check - NODE_ENV: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'test') {
      console.log(`📧 Email skipped in test: ${template} to ${to}`);
      await EmailLog.create({
        recipientEmail: to,
        recipientName: data.name || data.reporterName || 'Test User',
        subject: `[TEST] ${template}`,
        body: 'Email content skipped in test mode',
        templateName: template,
        status: 'sent',
        messageId: 'test-skip-' + Date.now()
      });
      return { success: true, messageId: 'test-message-id' };
    }

    // Skip emails in development if SMTP not properly configured
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_PASS) {
      console.log(`📧 Email skipped in development (SMTP not configured): ${template} to ${to}`);
      // Log for consistency
      await EmailLog.create({
        recipientEmail: to,
        recipientName: data.name || data.reporterName || 'Dev User',
        subject: `[DEV] ${template}`,
        body: 'Email content skipped in development mode (SMTP missing)',
        templateName: template,
        status: 'sent',
        messageId: 'dev-skip-' + Date.now()
      });
      return { success: true, messageId: 'dev-skip-' + Date.now() };
    }

    // Check if email template exists
    if (!emailTemplates[template]) {
      console.error(`❌ Email template '${template}' not found`);
      return { success: false, error: `Template '${template}' not found` };
    }

    // Check SMTP configuration
    console.log(`📧 SMTP Config check:`);
    console.log(`📧 SMTP_HOST: ${process.env.SMTP_HOST ? 'Set' : 'Missing'}`);
    console.log(`📧 SMTP_PORT: ${process.env.SMTP_PORT ? 'Set' : 'Missing'}`);
    console.log(`📧 SMTP_USER: ${process.env.SMTP_USER ? 'Set' : 'Missing'}`);
    console.log(`📧 SMTP_PASS: ${process.env.SMTP_PASS ? 'Set' : 'Missing'}`);
    console.log(`📧 FROM_NAME: ${process.env.FROM_NAME ? 'Set' : 'Missing'}`);
    console.log(`📧 FROM_EMAIL: ${process.env.FROM_EMAIL ? 'Set' : 'Missing'}`);

    // Check if SMTP is configured
    if (!process.env.SMTP_PASS) {
      console.log(`⚠️ SMTP config missing - returning success to prevent blocking`);
      return {
        success: true,
        messageId: 'smtp-bypass-' + Date.now(),
        note: 'Email bypassed due to missing SMTP config'
      };
    }

    const transporter = createTransporter();
    console.log(`📧 Transporter created`);

    const emailContent = emailTemplates[template](data);
    console.log(`📧 Email content generated for template: ${template}`);
    console.log(`📧 Subject: ${emailContent.subject}`);

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Moksha Sewa'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log(`📧 Mail options prepared`);
    console.log(`📧 From: ${mailOptions.from}`);
    console.log(`📧 To: ${mailOptions.to}`);

    // Add attachment if provided
    if (attachment) {
      mailOptions.attachments = [{
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType
      }];
      console.log(`📧 Attachment added: ${attachment.filename}`);
    }

    console.log(`📧 Attempting to send email...`);

    // Add timeout wrapper for production
    const sendWithTimeout = (transporter, mailOptions, timeout = 30000) => {
      return Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), timeout)
        )
      ]);
    };

    const result = await sendWithTimeout(transporter, mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    await EmailLog.create({
      recipientEmail: to,
      recipientName: data.name || data.reporterName || '',
      subject: mailOptions.subject,
      body: mailOptions.html,
      templateName: template,
      status: 'sent',
      messageId: result.messageId,
      metadata: data
    });

    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    try {
      await EmailLog.create({
        recipientEmail: to,
        recipientName: data?.name || data?.reporterName || '',
        subject: `[FAILED] ${template}`,
        body: 'Email sending failed',
        templateName: template,
        status: 'failed',
        errorMessage: error.message,
        metadata: data
      });
    } catch (logError) {
      console.error('❌ Failed to create email log:', logError);
    }

    // In production, don't block the application for email failures
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
    if (isProduction) {
      console.log('⚠️ Production mode: Email failure will not block application');
      return {
        success: false,
        error: error.message,
        production_bypass: true,
        note: 'Application continued despite email failure'
      };
    }

    return { success: false, error: error.message };
  }
};

// Test email function for debugging
const testEmail = async () => {
  try {
    console.log(`📧 Testing email configuration...`);

    const transporter = createTransporter();

    // Verify connection
    const verified = await transporter.verify();
    console.log(`📧 SMTP connection verified:`, verified);

    // Send test email
    const testResult = await sendEmail(
      process.env.SMTP_USER, // Send to self for testing
      'reportConfirmation', // Use existing template
      {
        reporterName: 'Test User',
        caseNumber: 'TEST-001',
        exactLocation: 'Test Location',
        area: 'Test Area',
        city: 'Test City'
      }
    );

    console.log(`📧 Test email result:`, testResult);
    return testResult;

  } catch (error) {
    console.error(`❌ Email test failed:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates, testEmail };