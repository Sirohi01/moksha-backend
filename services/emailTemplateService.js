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
    subject: 'Donation Receipt - {{receiptNumber}} - Moksha Seva',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🙏 Moksha Seva</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Dignity in Departure</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #ea580c; margin-bottom: 20px;">Donation Receipt</h2>
          <p>Dear {{name}},</p>
          <p>Thank you for your generous donation to Moksha Seva. Your contribution helps us provide dignified services to those in need.</p>
          
          <div style="background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #ea580c; margin-top: 0;">Receipt Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Receipt Number:</td>
                <td style="padding: 8px 0; color: #ea580c;">{{receiptNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Donation ID:</td>
                <td style="padding: 8px 0;">{{donationId}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold;">₹{{amount}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0;">{{createdAt}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0;">{{paymentMethod}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Purpose:</td>
                <td style="padding: 8px 0;">{{purpose}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #eff6ff; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1e40af; margin-top: 0;">Tax Exemption Information</h4>
            <p style="margin: 5px 0; font-size: 14px;">• This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961.</p>
            <p style="margin: 5px 0; font-size: 14px;">• Please retain this receipt for your tax filing purposes.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{receiptUrl}}" style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Full Receipt</a>
          </div>
          
          <p>Your support enables us to continue our mission of providing dignified cremation services and supporting families in their time of need.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Moksha Seva Foundation</strong></p>
            <p>Email: info@moksha-seva.org | Website: www.moksha-seva.org</p>
            <p>This is a computer-generated receipt.</p>
          </div>
        </div>
      </div>
    `
  },

  refundConfirmation: {
    subject: 'Refund Confirmation - {{donationId}} - Moksha Seva',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">🙏 Moksha Seva</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Refund Confirmation</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #dc2626;">Refund Processed</h2>
          <p>Dear {{name}},</p>
          <p>We have processed a refund for your donation as requested.</p>
          
          <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Refund Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Donation ID:</td>
                <td style="padding: 8px 0;">{{donationId}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Refund Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold;">₹{{amount}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Refund Date:</td>
                <td style="padding: 8px 0;">{{refundDate}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Reason:</td>
                <td style="padding: 8px 0;">{{refundReason}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> The refund will be credited to your original payment method within 5-7 business days.</p>
          </div>
          
          <p>If you have any questions about this refund, please contact our support team.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Moksha Seva Foundation</strong></p>
            <p>Email: info@moksha-seva.org | Website: www.moksha-seva.org</p>
          </div>
        </div>
      </div>
    `
  },

  refundAdminNotification: {
    subject: 'Refund Processed - {{donationId}} - Admin Notification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Refund Processed - Admin Notification</h2>
        <p>A refund has been processed for the following donation:</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donor Name:</strong> {{donorName}}</p>
          <p><strong>Donation ID:</strong> {{donationId}}</p>
          <p><strong>Refund Amount:</strong> ₹{{amount}}</p>
          <p><strong>Reason:</strong> {{refundReason}}</p>
          <p><strong>Processed At:</strong> {{refundDate}}</p>
        </div>
        <p>Please ensure the refund is processed in the payment gateway.</p>
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