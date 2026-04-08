const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const EmailTemplate = require('./models/EmailTemplate');

dotenv.config({ path: path.join(__dirname, '.env') });

const templates = [
  {
    name: 'otpVerification',
    subject: 'Verification Code: {{otp}} - Moksha Sewa',
    description: 'Email sent to users for OTP verification during login or registration.',
    category: 'Authentication',
    placeholders: ['otp'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Verification Required</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Moksha Sewa Security</p>
        </div>
        <div style="padding: 0 10px; text-align: center;">
          <h2 style="color: #1e3a8a; margin-bottom: 20px;">Your One-Time Password (OTP)</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Please use the following code to verify your email address. This code is valid for 5 minutes.</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 25px; margin: 30px auto; display: inline-block; border: 2px dashed #3b82f6; width: 80%;">
            <h1 style="margin: 0; font-size: 40px; letter-spacing: 12px; color: #1e3a8a; font-family: 'Courier New', Courier, monospace;">{{otp}}</h1>
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
          <div style="border-top: 2px solid #e5e7eb; padding-top: 25px; margin-top: 40px;">
            <p style="color: #374151; margin: 0; font-weight: bold;">Moksha Sewa Team</p>
            <p style="color: #64748b; margin: 5px 0; font-size: 12px;">Liberation Through Service</p>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'passwordReset',
    subject: 'Password Reset Request - Moksha Sewa Admin',
    description: 'Email sent when an admin requests a password reset.',
    category: 'Authentication',
    placeholders: ['name', 'resetUrl'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ea580c); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔒 Password Reset Request</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>You have requested to reset your password for your Moksha Sewa Admin account.</p>
        <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="color: #333; margin-top: 0;">Reset Instructions:</h3>
          <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="{{resetUrl}}" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p><small>If the button doesn't work, copy and paste this link: {{resetUrl}}</small></p>
        </div>
        <p style="margin-top: 20px;">Stay secure!</p>
        <p><strong>Moksha Sewa Security Team</strong></p>
      </div>
    `
  },
  {
    name: 'adminWelcome',
    subject: 'Welcome to Moksha Sewa Admin Panel - {{role}}',
    description: 'Sent to new administrators with their credentials.',
    category: 'Authentication',
    placeholders: ['name', 'email', 'role', 'tempPassword'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3730a3); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🔐 Welcome to Moksha Sewa</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Your admin account has been created successfully.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> {{email}}</p>
          <p><strong>Role:</strong> {{role}}</p>
          <p><strong>Temp Password:</strong> {{tempPassword}}</p>
        </div>
        <p>Please change your password immediately after first login.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'donationConfirmation',
    subject: '🙏 Donation Request Received - {{donationId}} - Moksha Sewa',
    description: 'Confirmation email sent when a user submits a donation request.',
    category: 'Donations',
    placeholders: ['name', 'donationId', 'amount', 'paymentMethod', 'receiptNumber'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">🙏 Thank You! Your Donation Request Received</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for your donation request to Moksha Sewa. Our team will contact you shortly to complete the donation process.</p>
        <div style="background: #f0fdfa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #333; margin-top: 0;">Your Donation Details:</h3>
          <p><strong>Donation ID:</strong> {{donationId}}</p>
          <p><strong>Amount:</strong> ₹{{amount}}</p>
          <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        </div>
        <p style="margin-top: 20px;">Your kindness will bring dignity to someone's final journey.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'paymentConfirmation',
    subject: '✅ Payment Successful - {{donationId}}',
    description: 'Email sent after a successful donation payment.',
    category: 'Donations',
    placeholders: ['name', 'donationId', 'paymentId', 'amount', 'receiptNumber'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0;">✅ Payment Successful!</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Your payment has been successfully processed. Thank you for your generous donation to Moksha Sewa.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
          <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
          <p><strong>Donation ID:</strong> {{donationId}}</p>
          <p><strong>Payment ID:</strong> {{paymentId}}</p>
          <p><strong>Amount:</strong> ₹{{amount}}</p>
          <p><strong>Receipt Number:</strong> {{receiptNumber}}</p>
        </div>
        <p style="margin-top: 20px;">Your contribution makes a real difference with Moksha Sewa.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'donationReceiptWithPDF',
    subject: '🙏 Donation Receipt - {{receiptNumber}} - Moksha Sewa',
    description: 'Sent to donors with their official 80G PDF receipt attached.',
    category: 'Donations',
    placeholders: ['name', 'receiptNumber', 'donationId', 'amount', 'createdAt', 'paymentStatus'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🙏 Moksha Sewa</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 16px;">Dignity in Departure</p>
        </div>
        <div style="padding: 0 10px;">
          <h2 style="color: #ea580c; margin-bottom: 20px; text-align: center;">Thank You for Your Donation!</h2>
          <p>Dear {{name}},</p>
          <p>Thank you for your generous contribution. Your official receipt {{receiptNumber}} is attached to this email.</p>
          <div style="background: #fff7ed; border: 2px solid #fed7aa; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #9a3412;"><strong>Amount:</strong> ₹{{amount}}</p>
            <p style="margin: 5px 0 0 0; color: #9a3412;"><strong>Receipt No:</strong> {{receiptNumber}}</p>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 20px;">Section 80G tax benefits apply to this donation.</p>
          <p style="text-align: center;"><strong>Moksha Sewa Foundation</strong></p>
        </div>
      </div>
    `
  },
  {
    name: 'donationAdminNotification',
    subject: '💰 New Donation Alert - ₹{{amount}}',
    description: 'Internal admin notification for a new donation received on platform.',
    category: 'Admin Notifications',
    placeholders: ['amount', 'donorName', 'donationId', 'paymentMethod', 'email', 'phone', 'city'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #10b981; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">💰 New Donation Alert!</h2>
        </div>
        <div style="padding: 24px;">
           <h1 style="color: #10b981; text-align: center; font-size: 48px; margin: 10px 0;">₹{{amount}}</h1>
           <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bcf1de;">
              <p><strong>Donor:</strong> {{donorName}}</p>
              <p><strong>Contact:</strong> {{phone}} / {{email}}</p>
              <p><strong>Location:</strong> {{city}}</p>
              <p><strong>Ref Code:</strong> {{donationId}}</p>
           </div>
           <p style="margin-top: 20px; text-align: center; color: #64748b;">Visit dashboard for full details.</p>
        </div>
      </div>
    `
  },
  {
    name: 'reportConfirmation',
    subject: 'Report Received - Case #{{caseNumber}} - Moksha Sewa',
    description: 'Confirmation sent when an unidentified body report is received.',
    category: 'Reporting',
    placeholders: ['reporterName', 'caseNumber', 'exactLocation', 'area', 'city'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #f4c430; padding: 25px; text-align: center; color: #1e3a8a; border-radius: 12px;">
          <h2 style="margin: 0;">📋 Case Report Received</h2>
          <p style="margin: 5px 0 0 0; font-weight: bold;">Case Number: #{{caseNumber}}</p>
        </div>
        <p>Dear {{reporterName}},</p>
        <p>Your report has been received. Our quick response team has been alerted.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 10px; border: 1px solid #fef3c7; margin: 20px 0;">
          <p><strong>Location:</strong> {{exactLocation}}</p>
          <p><strong>Area/City:</strong> {{area}}, {{city}}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <p>Moksha Sewa is committed to providing dignity in departure. Thank you for reporting.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'reportStatusUpdate',
    subject: 'Status Update: Case #{{caseNumber}}',
    description: 'Notification sent to reporter when case status changes (e.g. Dispatched).',
    category: 'Reporting',
    placeholders: ['reporterName', 'caseNumber', 'status', 'city', 'exactLocation'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #1e3a8a; padding: 25px; text-align: center; color: white; border-radius: 12px;">
          <h2 style="margin: 0;">📦 Report Status Changed</h2>
        </div>
        <p>Dear {{reporterName}},</p>
        <p>There is an update on Case #{{caseNumber}}:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: center;">
          <span style="text-transform: uppercase; font-weight: 800; font-size: 24px; color: #1e3a8a;">{{status}}</span>
        </div>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'reportAdminNotification',
    subject: '🚨 URGENT: New Report Filed - {{caseNumber}}',
    description: 'Internal admin alert for a new unidentified body report.',
    category: 'Admin Notifications',
    placeholders: ['caseNumber', 'area', 'city', 'reporterName', 'reporterPhone', 'exactLocation'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🚨 URGENT: Body Reported</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Incident Ref:</strong> {{caseNumber}}</p>
           <div style="background: #fee2e2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca; margin-top: 15px;">
              <p><strong>Location:</strong> {{exactLocation}}</p>
              <p><strong>District:</strong> {{area}}, {{city}}</p>
              <p><strong>Reporter:</strong> {{reporterName}} ({{reporterPhone}})</p>
           </div>
           <p style="margin-top: 20px; text-align: center; font-weight: bold; color: #ef4444;">Please dispatch the quick response team immediately.</p>
        </div>
      </div>
    `
  },
  {
    name: 'volunteerWelcome',
    subject: '🤝 Welcome to Moksha Sewa Family - {{volunteerId}}',
    description: 'Sent when a new volunteer application is received.',
    category: 'Volunteers',
    placeholders: ['name', 'volunteerId', 'registrationType', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #f59e0b; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">🤝 Welcome to the Family!</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Volunteer Application ID: {{volunteerId}}</p>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for your interest in joining Moksha Sewa as a volunteer. Your application has been received and is currently under review.</p>
        <div style="background: #fffbeb; padding: 20px; border-radius: 10px; border: 1px solid #fef3c7; margin: 20px 0;">
          <p><strong>Registration Type:</strong> {{registrationType}}</p>
          <p><strong>Current Status:</strong> {{status}}</p>
        </div>
        <p>Our volunteer coordination team will contact you shortly for the next steps.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'volunteerStatusUpdate',
    subject: 'Volunteer Application Status Update - {{volunteerId}}',
    description: 'Sent when a volunteer application status is changed by an admin.',
    category: 'Volunteers',
    placeholders: ['name', 'volunteerId', 'status', 'rejectionReason'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #1e3a8a; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">🤝 Application Update</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Your volunteer application (ID: {{volunteerId}}) status has been updated to:</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: center;">
          <span style="text-transform: uppercase; font-weight: 800; font-size: 24px; color: #1e3a8a;">{{status}}</span>
        </div>
        {{#if rejectionReason}}
        <p style="color: #64748b; font-style: italic;">Note: {{rejectionReason}}</p>
        {{/if}}
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'volunteerAdminNotification',
    subject: '🤝 NEW VOLUNTEER: {{name}} - {{city}}',
    description: 'Internal admin alert for a new volunteer application.',
    category: 'Admin Notifications',
    placeholders: ['name', 'city', 'volunteerId', 'email', 'phone', 'registrationType', 'occupation', 'skills'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #000080; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #000080; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🌟 New Volunteer Application</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Name:</strong> {{name}}</p>
           <p><strong>Location:</strong> {{city}}</p>
           <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; border: 1px solid #cce3ff; margin-top: 15px;">
              <p><strong>Contact:</strong> {{phone}} / {{email}}</p>
              <p><strong>Type:</strong> {{registrationType}}</p>
              <p><strong>Occupation:</strong> {{occupation}}</p>
              <p><strong>Skills:</strong> {{skills}}</p>
           </div>
           <p style="margin-top: 20px; text-align: center; color: #64748b;">Visit volunteer manager to review and approve.</p>
        </div>
      </div>
    `
  },
  {
    name: 'contactConfirmation',
    subject: 'Inquiry Received - Ticket #{{ticketNumber}} - Moksha Sewa',
    description: 'Sent when a user submits a contact form inquiry.',
    category: 'Support',
    placeholders: ['name', 'ticketNumber', 'subject', 'inquiryType'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #6366f1; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">📞 We've Received Your Message</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Support Ticket: #{{ticketNumber}}</p>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for reaching out to Moksha Sewa. We have received your inquiry regarding "<strong>{{subject}}</strong>".</p>
        <p>Our team typically responds within 24 hours of submission.</p>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
            <p style="margin: 0; color: #6366f1; font-weight: bold;">Moksha Sewa Support Desk</p>
        </div>
      </div>
    `
  },
  {
    name: 'contactResponse',
    subject: 'Response to Your Inquiry - #{{ticketNumber}}',
    description: 'Direct response sent from admin to a user regarding their inquiry.',
    category: 'Support',
    placeholders: ['name', 'ticketNumber', 'subject', 'responseMessage', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #6366f1; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">📧 Support Response</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Regarding your inquiry #{{ticketNumber}} ({{subject}}):</p>
        <div style="background: #f5f3ff; padding: 25px; border-radius: 12px; border: 1px solid #ddd6fe; margin: 25px 0; line-height: 1.6;">
          {{responseMessage}}
        </div>
        <p>If you have any further questions, please feel free to reply to this email.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'contactStatusUpdate',
    subject: 'Inquiry Status Update - #{{ticketNumber}}',
    description: 'Sent when the status of a support ticket is updated.',
    category: 'Support',
    placeholders: ['name', 'ticketNumber', 'subject', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}},</p>
        <p>Your support ticket #{{ticketNumber}} status has been updated to: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'contactAdminNotification',
    subject: '📞 New Inquiry: {{subject}} - #{{ticketNumber}}',
    description: 'Internal admin alert for a new contact form submission.',
    category: 'Admin Notifications',
    placeholders: ['ticketNumber', 'subject', 'message', 'name', 'phone', 'email', 'inquiryType'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #6366f1; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #6366f1; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">📞 New Contact Inquiry</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>From:</strong> {{name}} ({{phone}})</p>
           <p><strong>Subject:</strong> {{subject}}</p>
           <div style="background: #f5f3ff; padding: 15px; border-radius: 8px; border: 1px solid #ddd6fe; margin-top: 15px;">
              <p><strong>Message:</strong></p>
              <p style="font-style: italic;">{{message}}</p>
           </div>
           <p style="margin-top: 20px; text-align: center; color: #64748b;">ID: #{{ticketNumber}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'taskAssignment',
    subject: '🎯 New Task Assignment - {{taskId}} - Action Required',
    description: 'Sent to volunteers when a new field task is assigned to them.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'priority', 'dueDate', 'location', 'taskDescription'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0;">🎯 New Task Assigned</h1>
        </div>
        <p>Hello {{volunteerName}},</p>
        <p>You have been assigned a new task: <strong>{{taskTitle}}</strong></p>
        <div style="background: #eff6ff; padding: 20px; border-radius: 12px; border: 1px solid #93c5fd; margin: 20px 0;">
          <p><strong>Task ID:</strong> {{taskId}}</p>
          <p><strong>Priority:</strong> {{priority}}</p>
          <p><strong>Deadline:</strong> {{dueDate}}</p>
          <p><strong>Location:</strong> {{location}}</p>
        </div>
        <p>Please log in to your portal to accept the task and view full details.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'taskAccepted',
    subject: '✅ Task Accepted - {{taskId}} - Thank You!',
    description: 'Confirmation sent to volunteer after they accept an assigned task.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'acceptedAt'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #10b981; padding: 25px; text-align: center; color: white; border-radius: 12px;">
          <h2 style="margin: 0;">✅ Task Accepted</h2>
        </div>
        <p>Dear {{volunteerName}},</p>
        <p>Thank you for accepting <strong>{{taskTitle}}</strong> (ID: {{taskId}}). Please proceed with the task as per the instructions in your dashboard.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'taskRejected',
    subject: '❌ Task Declined - {{taskId}}',
    description: 'Confirmation sent to volunteer after they decline an assigned task.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'rejectionReason'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{volunteerName}},</p>
        <p>You have declined task <strong>{{taskTitle}}</strong> (ID: {{taskId}}).</p>
        {{#if rejectionReason}}<p>Reason: {{rejectionReason}}</p>{{/if}}
      </div>
    `
  },
  {
    name: 'taskCompleted',
    subject: '🎉 Task Completed - {{taskId}} - Great Job!',
    description: 'Sent to a volunteer when their field task is successfully marked as completed.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'completedAt'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center; color: white; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Task Completed!</h1>
        </div>
        <p>Dear {{volunteerName}}, excellent work on <strong>{{taskTitle}}</strong>!</p>
        <p>Your contribution has helped us provide dignity to a final journey today. Thank you for your service.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'assignmentApproved',
    subject: '✅ Assignment Approved - {{taskId}}',
    description: 'Sent to volunteer when admin formally approves their application for a specific task.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'approvedAt'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{volunteerName}}, your application for task <strong>{{taskTitle}}</strong> has been approved.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'assignmentRejected',
    subject: '❌ Task Assignment Update - {{taskId}}',
    description: 'Sent to volunteer when admin declines their request for a specific task.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'rejectedAt', 'rejectionReason'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{volunteerName}}, regarding task <strong>{{taskTitle}}</strong>, we are unable to assign this to you at this time.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'completionCertificate',
    subject: '🏆 Certificate of Appreciation - {{taskId}}',
    description: 'Official digital certificate sent to volunteers upon successful completion of field assignments.',
    category: 'Tasks',
    placeholders: ['volunteerName', 'taskId', 'taskTitle', 'completedDate'],
    body: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border: 15px solid #d4af37;">
        <div style="text-align: center;">
          <h1 style="color: #d4af37; font-size: 36px; margin: 0;">Certificate of Appreciation</h1>
          <p style="margin-top: 10px; font-style: italic;">This is awarded to</p>
          <h2 style="font-size: 28px; margin: 20px 0; border-bottom: 2px solid #eee; display: inline-block; padding: 0 40px;">{{volunteerName}}</h2>
          <p style="line-height: 1.6;">For outstanding contribution and dedicated service towards the completion of task <strong>{{taskTitle}}</strong> on {{completedDate}}.</p>
          <p style="margin-top: 40px;"><strong>Moksha Sewa Foundation</strong></p>
        </div>
      </div>
    `
  },
  {
    name: 'taskAcceptedAdmin',
    subject: '✅ Task Accepted by Volunteer - {{taskId}}',
    description: 'Admin alert when a volunteer accepts a newly assigned task.',
    category: 'Admin Notifications',
    placeholders: ['adminName', 'volunteerName', 'taskTitle', 'taskId'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #10b981; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #10b981; color: white; padding: 15px; text-align: center;">
          <h3 style="margin: 0;">✅ Task Accepted</h3>
        </div>
        <div style="padding: 20px;">
           <p><strong>Volunteer:</strong> {{volunteerName}}</p>
           <p><strong>Task:</strong> {{taskTitle}} ({{taskId}})</p>
        </div>
      </div>
    `
  },
  {
    name: 'taskRejectedAdmin',
    subject: '❌ Task Rejected by Volunteer - {{taskId}}',
    description: 'Admin alert when a volunteer declines a newly assigned task.',
    category: 'Admin Notifications',
    placeholders: ['adminName', 'volunteerName', 'taskTitle', 'taskId', 'rejectionReason'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #ef4444; color: white; padding: 15px; text-align: center;">
          <h3 style="margin: 0;">❌ Task Rejected</h3>
        </div>
        <div style="padding: 20px;">
           <p><strong>Volunteer:</strong> {{volunteerName}}</p>
           <p><strong>Task:</strong> {{taskTitle}} ({{taskId}})</p>
           <p><strong>Reason:</strong> {{rejectionReason}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'taskCompletedAdmin',
    subject: '🎉 Task Completed by Volunteer - {{taskId}}',
    description: 'Admin alert when a volunteer marks their field task as successfully completed.',
    category: 'Admin Notifications',
    placeholders: ['adminName', 'volunteerName', 'taskTitle', 'taskId', 'completionNotes', 'rating'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #8b5cf6; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #8b5cf6; color: white; padding: 15px; text-align: center;">
          <h3 style="margin: 0;">🎉 Task Completed</h3>
        </div>
        <div style="padding: 20px;">
           <p><strong>By:</strong> {{volunteerName}}</p>
           <p><strong>Task:</strong> {{taskTitle}} ({{taskId}})</p>
           <div style="background: #f5f3ff; padding: 10px; border-radius: 5px; margin-top: 10px;">
              <p><strong>Notes:</strong> {{completionNotes}}</p>
           </div>
        </div>
      </div>
    `
  },
  {
    name: 'boardApplicationConfirmation',
    subject: 'Application Received - Board of Advisors - {{applicationId}}',
    description: 'Sent when an application for the Board of Advisors is successfully submitted.',
    category: 'Applications',
    placeholders: ['name', 'applicationId', 'positionInterested', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #1e40af; padding: 30px; text-align: center; color: white; border-radius: 12px;">
          <h1 style="margin: 0; font-size: 24px;">👔 Board Application Received</h1>
        </div>
        <p>Dear {{name}},</p>
        <p>Your application to join the Board of Advisors for Moksha Sewa (ID: {{applicationId}}) has been received.</p>
        <p>We appreciate your interest in contributing your expertise to our mission.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'boardApplicationStatusUpdate',
    subject: 'Board Application Status Update - #{{applicationId}}',
    description: 'Sent when there is an update on a Board of Advisors application.',
    category: 'Applications',
    placeholders: ['name', 'applicationId', 'status', 'positionInterested'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, regarding your Board application #{{applicationId}}, the current status is now: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'boardApplicationAdminNotification',
    subject: '👔 New Board App: {{applicantName}} - #{{applicationId}}',
    description: 'Internal admin notification for a new high-profile Board of Advisors application.',
    category: 'Admin Notifications',
    placeholders: ['applicationId', 'applicantName', 'positionInterested', 'experience', 'organization', 'phone', 'email', 'motivationStatement'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
          <h3 style="margin: 0;">👔 New Board Advisor application</h3>
        </div>
        <div style="padding: 24px;">
           <p><strong>Applicant:</strong> {{applicantName}}</p>
           <p><strong>Org:</strong> {{organization}}</p>
           <p><strong>Position:</strong> {{positionInterested}}</p>
           <p><strong>Contact:</strong> {{phone}} / {{email}}</p>
           <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
           <p><strong>Motivation:</strong></p>
           <p style="font-style: italic; color: #64748b;">{{motivationStatement}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'expansionInquiryConfirmation',
    subject: 'Moksha Sewa Expansion Inquiry - #{{inquiryId}}',
    description: 'Sent when a user inquires about bringing Moksha Sewa to a new city.',
    category: 'Expansion',
    placeholders: ['name', 'inquiryId', 'proposedCity', 'proposedState'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #10b981; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">🌏 Expansion Inquiry Received</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for your interest in expanding Moksha Sewa to <strong>{{proposedCity}}, {{proposedState}}</strong>.</p>
        <p>Our expansion team will review your proposal and get back to you shortly.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'expansionInquiryAdminNotification',
    subject: '🌏 NEW EXPANSION INQUIRY: {{proposedCity}}',
    description: 'Internal admin alert for a potential new city expansion inquiry.',
    category: 'Admin Notifications',
    placeholders: ['inquiryId', 'name', 'phone', 'email', 'proposedCity', 'proposedState', 'message'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #10b981; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🌏 New City Expansion Request</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Proposed City:</strong> {{proposedCity}}, {{proposedState}}</p>
           <p><strong>From:</strong> {{name}} ({{phone}})</p>
           <p><strong>Message:</strong> {{message}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'feedbackConfirmation',
    subject: 'Thank You for Your Feedback - Moksha Sewa',
    description: 'Sent when a user submits a story or feedback on the platform.',
    category: 'Feedback',
    placeholders: ['name', 'feedbackType'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, thank you for sharing your {{feedbackType}} with us. Your voice helps us improve our service.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'feedbackAdminNotification',
    subject: '📝 NEW FEEDBACK: {{name}}',
    description: 'Internal admin alert when new public feedback or a story is submitted.',
    category: 'Admin Notifications',
    placeholders: ['name', 'feedbackType', 'rating', 'message', 'phone'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #6366f1; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #6366f1; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">📝 New Feedback Received</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Type:</strong> {{feedbackType}}</p>
           <p><strong>From:</strong> {{name}} ({{phone}})</p>
           <p><strong>Rating:</strong> {{rating}}/5</p>
           <p><strong>Comment:</strong> {{message}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'schemeApplicationConfirmation',
    subject: 'Scheme Application Received - #{{applicationId}}',
    description: 'Sent when a user applies for a government scheme through the portal.',
    category: 'Schemes',
    placeholders: ['name', 'applicationId', 'schemeName', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #1e3a8a; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">📜 Scheme Application Filed</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">App ID: {{applicationId}}</p>
        </div>
        <p>Dear {{name}},</p>
        <p>Your application for <strong>{{schemeName}}</strong> has been successfully received.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'schemeApplicationStatusUpdate',
    subject: 'Update on Your Scheme Application - #{{applicationId}}',
    description: 'Sent when the status of a government scheme application is updated.',
    category: 'Schemes',
    placeholders: ['name', 'applicationId', 'schemeName', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, your application for #{{schemeName}} status is now: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'schemeAdminNotification',
    subject: '📜 NEW SCHEME APP: {{schemeName}}',
    description: 'Internal admin alert for a new government scheme application.',
    category: 'Admin Notifications',
    placeholders: ['applicationId', 'schemeName', 'name', 'phone', 'email', 'city'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #1e3a8a; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">📜 New Scheme Application</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Scheme:</strong> {{schemeName}}</p>
           <p><strong>Applicant:</strong> {{name}} ({{phone}})</p>
           <p><strong>City:</strong> {{city}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'yatraRequestConfirmation',
    subject: 'Sacred Ritual Request Received - #{{requestId}}',
    description: 'Sent when a user requests Antim Yatra (Final Journey) services.',
    category: 'Requests',
    placeholders: ['name', 'requestId', 'serviceName', 'location'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #f59e0b; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">🕊️ Ritual Request Received</h2>
        </div>
        <p>Dear {{name}}, we have received your request for <strong>{{serviceName}}</strong>.</p>
        <p>Our team is available 24/7 and will coordinate everything with compassion.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'yatraAdminNotification',
    subject: '🕊️ URGENT: Ritual Request - {{serviceName}}',
    description: 'Internal admin alert for an urgent Antim Yatra or ritual service request.',
    category: 'Admin Notifications',
    placeholders: ['requestId', 'serviceName', 'name', 'phone', 'location', 'preferredDate'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #f59e0b; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🕊️ URGENT RITUAL REQUEST</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>Service:</strong> {{serviceName}}</p>
           <p><strong>Requester:</strong> {{name}} ({{phone}})</p>
           <p><strong>Location:</strong> {{location}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'remembranceConfirmation',
    subject: 'Remembrance Post Created - Moksha Sewa',
    description: 'Sent when a user creates a remembrance post for a loved one.',
    category: 'Requests',
    placeholders: ['name', 'deceasedName', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, your remembrance post for <strong>{{deceasedName}}</strong> has been submitted.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'remembranceAdminNotification',
    subject: '🤍 NEW REMEMBRANCE: {{deceasedName}}',
    description: 'Internal admin alert when a new remembrance post is created.',
    category: 'Admin Notifications',
    placeholders: ['name', 'deceasedName', 'relation', 'phone'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #64748b; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #64748b; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🤍 New Remembrance Post</h2>
        </div>
        <div style="padding: 24px;">
           <p><strong>For:</strong> {{deceasedName}}</p>
           <p><strong>By:</strong> {{name}} ({{relation}})</p>
        </div>
      </div>
    `
  },
  {
    name: 'feedbackResponse',
    subject: 'Response to Your Feedback - Moksha Sewa',
    description: 'Admin response to user submitted feedback.',
    category: 'Feedback',
    placeholders: ['name', 'referenceNumber', 'feedbackType', 'responseMessage', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #10b981; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">📧 Response to Your Feedback</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ref: {{referenceNumber}}</p>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for your feedback regarding {{feedbackType}}. We have reviewed your submission:</p>
        <div style="background: #eff6ff; padding: 25px; border-radius: 12px; border: 1px solid #3b82f6; margin: 25px 0; line-height: 1.6;">
          {{responseMessage}}
        </div>
        <p>Your input helps us improve our services for everyone.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'feedbackStatusUpdate',
    subject: 'Feedback Status Update - {{referenceNumber}}',
    description: 'Sent when the status of a feedback entry is changed.',
    category: 'Feedback',
    placeholders: ['name', 'referenceNumber', 'feedbackType', 'status'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, the status of your feedback (Ref: {{referenceNumber}}) has been updated to: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'legacyGivingConfirmation',
    subject: 'Legacy Giving Information Request - {{requestId}}',
    description: 'Sent when a user inquires about legacy giving/wills.',
    category: 'Donations',
    placeholders: ['name', 'requestId', 'legacyType', 'timeframe'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <div style="background: #7c3aed; padding: 25px; border-radius: 12px; text-align: center; color: white;">
          <h2 style="margin: 0;">🌟 Legacy Giving Request</h2>
        </div>
        <p>Dear {{name}},</p>
        <p>Thank you for considering a legacy gift to Moksha Sewa. Your thoughtful planning will create a lasting impact.</p>
        <div style="background: #faf5ff; padding: 20px; border-radius: 10px; border: 1px solid #ddd6fe; margin: 20px 0;">
          <p><strong>Request ID:</strong> {{requestId}}</p>
          <p><strong>Type:</strong> {{legacyType}}</p>
        </div>
        <p>Our legacy giving specialist will contact you confidentially to discuss your vision.</p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'legacyGivingStatusUpdate',
    subject: 'Legacy Giving Status Update - {{requestId}}',
    description: 'Sent when a legacy giving request status is updated.',
    category: 'Donations',
    placeholders: ['name', 'requestId', 'status', 'legacyType'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, your legacy giving request (ID: {{requestId}}) status is now: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'legacyGivingAdminNotification',
    subject: '🌟 NEW LEGACY GIVING: {{requesterName}}',
    description: 'Internal admin alert for a new legacy giving inquiry.',
    category: 'Admin Notifications',
    placeholders: ['requestId', 'requesterName', 'legacyType', 'estimatedValue', 'phone', 'email', 'timeframe'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #7c3aed; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #7c3aed; color: white; padding: 15px; text-align: center;">
          <h3 style="margin: 0;">🌟 New Legacy Giving Inquiry</h3>
        </div>
        <div style="padding: 20px;">
           <p><strong>Requester:</strong> {{requesterName}}</p>
           <p><strong>Type:</strong> {{legacyType}}</p>
           <p><strong>Contact:</strong> {{phone}} / {{email}}</p>
           <p><strong>Value:</strong> {{estimatedValue}}</p>
        </div>
      </div>
    `
  },
  {
    name: 'expansionRequestStatusUpdate',
    subject: 'Expansion Request Status Update - {{requestId}}',
    description: 'Sent when an expansion request status is updated.',
    category: 'Expansion',
    placeholders: ['name', 'requestId', 'status', 'requestedCity'],
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 20px;">
        <p>Dear {{name}}, your expansion request for {{requestedCity}} status is now: <strong>{{status}}</strong></p>
        <p><strong>Moksha Sewa Team</strong></p>
      </div>
    `
  },
  {
    name: 'newsletterAdminNotification',
    subject: '📩 New newsletter subscriber: {{email}}',
    description: 'Internal admin alert for a new newsletter subscription.',
    category: 'Admin Notifications',
    placeholders: ['email', 'source'],
    body: `
      <div style="font-family: Arial, sans-serif; border: 2px solid #6366f1; border-radius: 12px; overflow: hidden; max-width: 600px;">
        <div style="background: #6366f1; color: white; padding: 15px; text-align: center;">
          <h3 style="margin: 0;">📩 New Subscriber Alert</h3>
        </div>
        <div style="padding: 20px;">
           <p><strong>Email:</strong> {{email}}</p>
           <p><strong>Source:</strong> {{source}}</p>
        </div>
      </div>
    `
  }
];

async function seedTemplates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    for (const template of templates) {
      await EmailTemplate.findOneAndUpdate(
        { name: template.name },
        template,
        { upsert: true, new: true }
      );
      console.log(`Seeded/Updated template: ${template.name}`);
    }

    console.log('Template seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding templates:', error);
    process.exit(1);
  }
}

seedTemplates();
