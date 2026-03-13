const emailTemplates = {
  // Technical Support Templates
  contactResponse: {
    subject: 'Thank you for contacting Moksha Seva',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for reaching out!</h2>
        <p>Dear {{name}},</p>
        <p>We have received your message and our team will respond within 24-48 hours.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>Your Message:</strong><br>
          {{message}}
        </div>
        <p>Reference ID: <strong>{{referenceId}}</strong></p>
        <p>Best regards,<br>Moksha Seva Team</p>
      </div>
    `
  },

  volunteerWelcome: {
    subject: 'Welcome to Moksha Seva Volunteer Program',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Welcome to our volunteer family!</h2>
        <p>Dear {{name}},</p>
        <p>Thank you for your interest in volunteering with Moksha Seva. We are excited to have you join our mission.</p>
        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Our volunteer coordinator will contact you within 3-5 days</li>
            <li>You'll receive orientation materials via email</li>
            <li>We'll schedule your first volunteer session</li>
          </ul>
        </div>
        <p>Application ID: <strong>{{applicationId}}</strong></p>
        <p>Together we serve,<br>Moksha Seva Team</p>
      </div>
    `
  },

  donationReceipt: {
    subject: 'Donation Receipt - Moksha Seva',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Thank you for your generous donation!</h2>
        <p>Dear {{donorName}},</p>
        <p>We are deeply grateful for your contribution to Moksha Seva.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3>Donation Details:</h3>
          <p><strong>Amount:</strong> ₹{{amount}}</p>
          <p><strong>Date:</strong> {{date}}</p>
          <p><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        </div>
        <p>Your donation helps us continue our mission of serving the community.</p>
        <p>With gratitude,<br>Moksha Seva Team</p>
      </div>
    `
  },

  statusUpdate: {
    subject: 'Status Update - {{type}} Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Application Status Update</h2>
        <p>Dear {{name}},</p>
        <p>Your {{type}} application status has been updated.</p>
        <div style="background: #f5f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Application ID:</strong> {{applicationId}}</p>
          <p><strong>Current Status:</strong> {{status}}</p>
          <p><strong>Updated On:</strong> {{updatedDate}}</p>
          {{#if notes}}
          <p><strong>Notes:</strong> {{notes}}</p>
          {{/if}}
        </div>
        <p>Best regards,<br>Moksha Seva Team</p>
      </div>
    `
  }
};

const generateEmail = (templateName, data) => {
  const template = emailTemplates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  let html = template.html;
  let subject = template.subject;

  // Simple template replacement
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key] || '');
    subject = subject.replace(regex, data[key] || '');
  });

  return { subject, html };
};

module.exports = {
  emailTemplates,
  generateEmail
};