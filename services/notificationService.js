const WebSocket = require('ws');
const { generateEmail } = require('./emailTemplateService');
const emailService = require('./emailService');

class NotificationService {
  constructor() {
    this.clients = new Map();
    this.wss = null;
  }

  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'auth' && data.userId) {
            this.clients.set(data.userId, ws);
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Moksha Seva notifications',
        timestamp: new Date().toISOString()
      }));
    });
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  // Send real-time notification to specific user
  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'notification',
        ...notification,
        timestamp: new Date().toISOString()
      }));
    }
  }

  // Broadcast to all connected clients
  broadcast(notification) {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'broadcast',
          ...notification,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  // Send email notification
  async sendEmailNotification(type, recipientEmail, data) {
    try {
      const { subject, html } = generateEmail(type, data);
      await emailService.sendEmail(recipientEmail, subject, html);
      return true;
    } catch (error) {
      console.error('Email notification error:', error);
      return false;
    }
  }

  // Combined notification (real-time + email)
  async sendNotification(options) {
    const {
      userId,
      email,
      type,
      title,
      message,
      data = {},
      sendEmail = false,
      emailTemplate = null
    } = options;

    // Send real-time notification
    if (userId) {
      this.sendToUser(userId, { type, title, message, data });
    }

    // Send email notification
    if (sendEmail && email && emailTemplate) {
      await this.sendEmailNotification(emailTemplate, email, data);
    }

    // Log notification
    console.log(`📧 Notification sent: ${type} - ${title}`);
  }

  // Specific notification methods
  async notifyNewSubmission(type, data) {
    this.broadcast({
      type: 'new_submission',
      title: `New ${type} Submission`,
      message: `A new ${type} has been submitted`,
      data: { submissionType: type, ...data }
    });
  }

  async notifyStatusUpdate(userId, email, type, status, data) {
    await this.sendNotification({
      userId,
      email,
      type: 'status_update',
      title: 'Application Status Updated',
      message: `Your ${type} status has been updated to: ${status}`,
      data: { type, status, ...data },
      sendEmail: true,
      emailTemplate: 'statusUpdate'
    });
  }

  async notifyAdminAlert(priority, title, message, data = {}) {
    this.broadcast({
      type: 'admin_alert',
      priority,
      title,
      message,
      data
    });
  }
}

module.exports = new NotificationService();