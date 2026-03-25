const cron = require('node-cron');
const { generateEmail } = require('./emailTemplateService');
const emailService = require('./emailService');
const notificationService = require('./notificationService');

class EmailSequenceService {
  constructor() {
    this.sequences = new Map();
    this.scheduledJobs = new Map();
    this.initializeSequences();
  }

  initializeSequences() {
    // Define email sequences
    this.sequences.set('volunteer_onboarding', {
      name: 'Volunteer Onboarding Sequence',
      description: 'Welcome and onboard new volunteers',
      emails: [
        {
          delay: 0, // Immediate
          template: 'volunteerWelcome',
          subject: 'Welcome to Moksha Sewa!'
        },
        {
          delay: 24 * 60 * 60 * 1000, // 1 day
          template: 'volunteerOrientation',
          subject: 'Your Volunteer Orientation Guide'
        },
        {
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days
          template: 'volunteerFirstWeek',
          subject: 'How was your first week?'
        },
        {
          delay: 30 * 24 * 60 * 60 * 1000, // 30 days
          template: 'volunteerMonthly',
          subject: 'Monthly Volunteer Update'
        }
      ]
    });

    this.sequences.set('donor_nurturing', {
      name: 'Donor Nurturing Sequence',
      description: 'Engage and retain donors',
      emails: [
        {
          delay: 0, // Immediate
          template: 'donationReceipt',
          subject: 'Thank you for your donation!'
        },
        {
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days
          template: 'donationImpact',
          subject: 'See the impact of your donation'
        },
        {
          delay: 30 * 24 * 60 * 60 * 1000, // 30 days
          template: 'donorUpdate',
          subject: 'Monthly impact report'
        },
        {
          delay: 90 * 24 * 60 * 60 * 1000, // 90 days
          template: 'donorRetention',
          subject: 'Continue making a difference'
        }
      ]
    });

    this.sequences.set('contact_followup', {
      name: 'Contact Follow-up Sequence',
      description: 'Follow up on contact form submissions',
      emails: [
        {
          delay: 0, // Immediate
          template: 'contactResponse',
          subject: 'Thank you for contacting us'
        },
        {
          delay: 24 * 60 * 60 * 1000, // 1 day
          template: 'contactFollowup',
          subject: 'Following up on your inquiry'
        },
        {
          delay: 7 * 24 * 60 * 60 * 1000, // 7 days
          template: 'contactSurvey',
          subject: 'How did we do?'
        }
      ]
    });

    // Start cron job for processing scheduled emails
    this.startScheduler();
  }

  startScheduler() {
    // Run every minute to check for scheduled emails
    cron.schedule('* * * * *', () => {
      this.processScheduledEmails();
    });

    console.log('📧 Email sequence scheduler started');
  }

  async startSequence(sequenceId, recipientData) {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`);
    }

    const sequenceInstanceId = `${sequenceId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Schedule all emails in the sequence
    for (let i = 0; i < sequence.emails.length; i++) {
      const email = sequence.emails[i];
      const scheduledTime = new Date(Date.now() + email.delay);

      await this.scheduleEmail({
        sequenceInstanceId,
        sequenceId,
        emailIndex: i,
        recipientEmail: recipientData.email,
        recipientData,
        template: email.template,
        subject: email.subject,
        scheduledTime
      });
    }

    console.log(`📧 Started sequence ${sequenceId} for ${recipientData.email}`);
    return sequenceInstanceId;
  }

  async scheduleEmail(emailData) {
    try {
      // Store in database (you would implement this with your DB)
      const scheduledEmail = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...emailData,
        status: 'scheduled',
        createdAt: new Date(),
        attempts: 0
      };

      // In a real implementation, you'd save this to MongoDB
      // For now, we'll use in-memory storage
      if (!this.scheduledJobs.has(emailData.sequenceInstanceId)) {
        this.scheduledJobs.set(emailData.sequenceInstanceId, []);
      }

      this.scheduledJobs.get(emailData.sequenceInstanceId).push(scheduledEmail);

      return scheduledEmail.id;
    } catch (error) {
      console.error('Failed to schedule email:', error);
      throw error;
    }
  }

  async processScheduledEmails() {
    const now = new Date();

    // Process all scheduled email jobs
    for (const [sequenceInstanceId, emails] of this.scheduledJobs.entries()) {
      for (const email of emails) {
        if (email.status === 'scheduled' && new Date(email.scheduledTime) <= now) {
          await this.sendScheduledEmail(email);
        }
      }
    }
  }

  async sendScheduledEmail(scheduledEmail) {
    try {
      scheduledEmail.status = 'sending';
      scheduledEmail.attempts += 1;

      // Generate email content from template
      const { subject, html } = generateEmail(scheduledEmail.template, scheduledEmail.recipientData);

      // Send email
      await emailService.sendEmail(
        scheduledEmail.recipientEmail,
        scheduledEmail.subject || subject,
        html
      );

      scheduledEmail.status = 'sent';
      scheduledEmail.sentAt = new Date();

      console.log(`📧 Sent scheduled email: ${scheduledEmail.template} to ${scheduledEmail.recipientEmail}`);

      // Send notification to admin
      await notificationService.sendNotification({
        type: 'email_sequence',
        title: 'Scheduled Email Sent',
        message: `Email "${scheduledEmail.subject}" sent to ${scheduledEmail.recipientEmail}`,
        data: {
          sequenceId: scheduledEmail.sequenceId,
          template: scheduledEmail.template,
          recipient: scheduledEmail.recipientEmail
        }
      });

    } catch (error) {
      console.error('Failed to send scheduled email:', error);

      scheduledEmail.status = 'failed';
      scheduledEmail.error = error.message;
      scheduledEmail.lastAttempt = new Date();

      // Retry logic (max 3 attempts)
      if (scheduledEmail.attempts < 3) {
        // Reschedule for 1 hour later
        scheduledEmail.scheduledTime = new Date(Date.now() + 60 * 60 * 1000);
        scheduledEmail.status = 'scheduled';
      }
    }
  }

  async stopSequence(sequenceInstanceId) {
    const emails = this.scheduledJobs.get(sequenceInstanceId);
    if (emails) {
      emails.forEach(email => {
        if (email.status === 'scheduled') {
          email.status = 'cancelled';
        }
      });
    }

    console.log(`📧 Stopped sequence ${sequenceInstanceId}`);
  }

  async getSequenceStatus(sequenceInstanceId) {
    const emails = this.scheduledJobs.get(sequenceInstanceId);
    if (!emails) {
      return null;
    }

    const total = emails.length;
    const sent = emails.filter(e => e.status === 'sent').length;
    const scheduled = emails.filter(e => e.status === 'scheduled').length;
    const failed = emails.filter(e => e.status === 'failed').length;

    return {
      sequenceInstanceId,
      total,
      sent,
      scheduled,
      failed,
      progress: Math.round((sent / total) * 100),
      emails: emails.map(e => ({
        id: e.id,
        template: e.template,
        subject: e.subject,
        scheduledTime: e.scheduledTime,
        status: e.status,
        sentAt: e.sentAt,
        error: e.error
      }))
    };
  }

  getAvailableSequences() {
    return Array.from(this.sequences.entries()).map(([id, sequence]) => ({
      id,
      name: sequence.name,
      description: sequence.description,
      emailCount: sequence.emails.length
    }));
  }

  // Trigger sequences based on events
  async triggerSequenceForEvent(eventType, data) {
    switch (eventType) {
      case 'volunteer_registered':
        await this.startSequence('volunteer_onboarding', {
          email: data.email,
          name: data.name,
          applicationId: data.applicationId,
          skills: data.skills
        });
        break;

      case 'donation_received':
        await this.startSequence('donor_nurturing', {
          email: data.email,
          donorName: data.donorName,
          amount: data.amount,
          transactionId: data.transactionId,
          date: new Date().toLocaleDateString()
        });
        break;

      case 'contact_submitted':
        await this.startSequence('contact_followup', {
          email: data.email,
          name: data.name,
          subject: data.subject,
          message: data.message,
          referenceId: data.referenceId
        });
        break;

      default:
        console.log(`No sequence defined for event: ${eventType}`);
    }
  }

  // Analytics
  async getSequenceAnalytics(sequenceId, dateRange = { days: 30 }) {
    // In a real implementation, you'd query your database
    const startDate = new Date(Date.now() - (dateRange.days * 24 * 60 * 60 * 1000));

    // Mock analytics data
    return {
      sequenceId,
      period: `Last ${dateRange.days} days`,
      totalStarted: 150,
      totalCompleted: 120,
      completionRate: 80,
      averageOpenRate: 65,
      averageClickRate: 12,
      unsubscribeRate: 2,
      emailBreakdown: [
        { emailIndex: 0, sent: 150, opened: 135, clicked: 25, bounced: 2 },
        { emailIndex: 1, sent: 148, opened: 118, clicked: 18, bounced: 1 },
        { emailIndex: 2, sent: 145, opened: 98, clicked: 15, bounced: 0 },
        { emailIndex: 3, sent: 142, opened: 85, clicked: 12, bounced: 1 }
      ]
    };
  }
}

module.exports = new EmailSequenceService();