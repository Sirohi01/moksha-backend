const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Complete Email Templates for ALL Forms
const emailTemplates = {
  // Report Form Templates
  reportConfirmation: (data) => ({
    subject: `Report Received - Case #${data.caseNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f4c430, #20b2aa); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🙏 Report Received - Moksha Seva</h2>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p><strong>Moksha Seva Team</strong><br>
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
          <h2 style="color: white; margin: 0;">💚 Thank You - Moksha Seva</h2>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>We have an update regarding your feedback submission with Moksha Seva.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Volunteer Form Templates
  volunteerWelcome: (data) => ({
    subject: `Welcome to Moksha Seva Family - ${data.volunteerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🤝 Welcome to Moksha Seva Family!</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Welcome to the Moksha Seva volunteer family! Your application has been received and you are now part of our mission to serve humanity.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>We have an update regarding your volunteer application with Moksha Seva.</p>
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
        <p style="margin-top: 20px;">Thank you for your interest in volunteering with Moksha Seva.</p>
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>Thank you for contacting Moksha Seva. We have received your inquiry and will respond promptly.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>We have an update regarding your contact inquiry with Moksha Seva.</p>
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
          <p style="margin: 5px 0;">• Thank you for contacting Moksha Seva</p>
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
        <p style="margin-top: 20px;">Thank you for contacting Moksha Seva.</p>
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Donation Form Templates
  donationConfirmation: (data) => ({
    subject: `Donation Receipt - ${data.donationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🙏 Thank You for Your Donation!</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your generous donation to Moksha Seva. Your contribution helps us serve those in need with dignity and compassion.</p>
        <div style="background: #f0fdfa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #333; margin-top: 0;">Donation Details:</h3>
          <p><strong>Donation ID:</strong> ${data.donationId}</p>
          <p><strong>Amount:</strong> ₹${data.amount}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</p>
          <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="background: #fef7ff; padding: 15px; border-radius: 5px; border: 1px solid #d8b4fe;">
          <p style="margin: 0;"><strong>📄 Tax Benefits:</strong></p>
          <p style="margin: 5px 0;">• This donation is eligible for 80G tax exemption</p>
          <p style="margin: 5px 0;">• Official receipt will be sent separately</p>
          <p style="margin: 5px 0;">• Keep this email for your records</p>
        </div>
        <p style="margin-top: 20px;">Your kindness makes a real difference in someone's final journey.</p>
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
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
        <p>Your payment has been successfully processed. Thank you for your generous donation to Moksha Seva.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Board Application Templates
  boardApplicationConfirmation: (data) => ({
    subject: `Board Application Received - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">👔 Board Application Received</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Thank you for your interest in joining the Moksha Seva Board. Your application has been received and is under review.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>We have an update regarding your board application with Moksha Seva.</p>
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
          <p style="margin: 5px 0;">• Please prepare to discuss your experience and vision for Moksha Seva</p>
        </div>
        ` : ''}
        ${data.status === 'approved' ? `
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; border: 1px solid #86efac;">
          <p style="margin: 0;"><strong>🎉 Congratulations!</strong></p>
          <p style="margin: 5px 0;">• Your application has been approved!</p>
          <p style="margin: 5px 0;">• Welcome to the Moksha Seva Board of Advisors</p>
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
        <p style="margin-top: 20px;">Thank you for your interest in serving with Moksha Seva.</p>
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>Thank you for considering a legacy gift to Moksha Seva. Your thoughtful planning will create a lasting impact for generations.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>We have an update regarding your legacy giving request with Moksha Seva.</p>
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
          <p style="margin: 5px 0;">• Thank you for your interest in Moksha Seva's mission</p>
        </div>
        ` : ''}
        <p style="margin-top: 20px;">Thank you for considering Moksha Seva for your legacy giving.</p>
        <p><strong>Moksha Seva Team</strong><br>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p><strong>Moksha Seva Team</strong><br>
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
        <p>Thank you for your request to expand Moksha Seva services to ${data.requestedCity}, ${data.requestedState}. We appreciate your initiative.</p>
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
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Admin Notification Templates
  reportAdminNotification: (data) => ({
    subject: `🚨 URGENT: New Report Submitted - ${data.caseNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 URGENT: New Report Submitted</h2>
        <p><strong>Case Number:</strong> ${data.caseNumber}</p>
        <p><strong>Reporter:</strong> ${data.reporterName || 'Anonymous'}</p>
        <p><strong>Location:</strong> ${data.exactLocation}, ${data.area}, ${data.city}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p style="color: #dc2626;"><strong>ACTION REQUIRED: Immediate response needed</strong></p>
      </div>
    `
  }),

  donationAdminNotification: (data) => ({
    subject: `💰 New Donation Received - ₹${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">💰 New Donation Received</h2>
        <p><strong>Donor:</strong> ${data.donorName}</p>
        <p><strong>Amount:</strong> ₹${data.amount}</p>
        <p><strong>Donation ID:</strong> ${data.donationId}</p>
        <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  volunteerAdminNotification: (data) => ({
    subject: `🤝 New Volunteer Application - ${data.volunteerId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🤝 New Volunteer Application</h2>
        <p><strong>Volunteer:</strong> ${data.name}</p>
        <p><strong>Volunteer ID:</strong> ${data.volunteerId}</p>
        <p><strong>Registration Type:</strong> ${data.registrationType}</p>
        <p><strong>Volunteer Types:</strong> ${data.volunteerTypes ? data.volunteerTypes.join(', ') : 'Not specified'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  contactAdminNotification: (data) => ({
    subject: `📞 New Contact Inquiry - ${data.ticketNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">📞 New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Ticket Number:</strong> ${data.ticketNumber}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Inquiry Type:</strong> ${data.inquiryType || 'General'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  boardApplicationAdminNotification: (data) => ({
    subject: `👔 New Board Application - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">👔 New Board Application</h2>
        <p><strong>Applicant:</strong> ${data.applicantName}</p>
        <p><strong>Application ID:</strong> ${data.applicationId}</p>
        <p><strong>Position:</strong> ${data.positionInterested}</p>
        <p><strong>Experience:</strong> ${data.experience} years</p>
        <p><strong>Organization:</strong> ${data.organization}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  legacyGivingAdminNotification: (data) => ({
    subject: `🌟 New Legacy Giving Request - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">🌟 New Legacy Giving Request</h2>
        <p><strong>Requester:</strong> ${data.requesterName}</p>
        <p><strong>Request ID:</strong> ${data.requestId}</p>
        <p><strong>Legacy Type:</strong> ${data.legacyType}</p>
        <p><strong>Estimated Value:</strong> ${data.estimatedValue || 'Not specified'}</p>
        <p><strong>Timeframe:</strong> ${data.timeframe || 'Not specified'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  schemeApplicationAdminNotification: (data) => ({
    subject: `🏛️ New Scheme Application - ${data.applicationId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🏛️ New Government Scheme Application</h2>
        <p><strong>Applicant:</strong> ${data.name}</p>
        <p><strong>Application ID:</strong> ${data.applicationId}</p>
        <p><strong>Scheme:</strong> ${data.schemeName}</p>
        <p><strong>Type:</strong> ${data.schemeType}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  expansionRequestAdminNotification: (data) => ({
    subject: `🌍 New Expansion Request - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0891b2;">🌍 New Expansion Request</h2>
        <p><strong>Requester:</strong> ${data.name}</p>
        <p><strong>Request ID:</strong> ${data.requestId}</p>
        <p><strong>Location:</strong> ${data.requestedCity}, ${data.requestedState}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  feedbackAdminNotification: (data) => ({
    subject: `💚 New Feedback Received - ${data.referenceNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">💚 New Feedback Received</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Reference:</strong> ${data.referenceNumber}</p>
        <p><strong>Type:</strong> ${data.feedbackType}</p>
        <p><strong>Rating:</strong> ${data.experienceRating}/5 stars</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  }),

  expansionRequestStatusUpdate: (data) => ({
    subject: `Expansion Request Status Update - ${data.requestId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0891b2, #0e7490); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">📋 Expansion Request Update</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>We have an update regarding your expansion request for Moksha Seva services.</p>
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
        <p style="margin-top: 20px;">Thank you for your interest in expanding Moksha Seva's reach.</p>
        <p><strong>Moksha Seva Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  // Authentication Email Templates
  adminWelcome: (data) => ({
    subject: `Welcome to Moksha Seva Admin Panel - ${data.role.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔐 Welcome to Moksha Seva Admin Panel</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>Welcome to the Moksha Seva Admin Panel! Your account has been created successfully.</p>
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
        <p><strong>Moksha Seva Admin Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: `Password Reset Request - Moksha Seva Admin`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔒 Password Reset Request</h2>
        </div>
        <p>Dear ${data.name},</p>
        <p>You have requested to reset your password for your Moksha Seva Admin account.</p>
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
        <p><strong>Moksha Seva Security Team</strong><br>
        <small>Liberation Through Service</small></p>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    // Skip email sending in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log(`📧 Email skipped in test: ${template} to ${to}`);
      return { success: true, messageId: 'test-message-id' };
    }

    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, emailTemplates };