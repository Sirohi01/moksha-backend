const WebSocket = require('ws');
const { generateEmail } = require('./emailTemplateService');
const emailService = require('./emailService');
const SupportChat = require('../models/SupportChat');
const SupportMessage = require('../models/SupportMessage');

class NotificationService {
  constructor() {
    this.clients = new Map();
    this.chatClients = new Map();
    this.wss = null;
  }

  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      console.log(`[WS] New client connected: ${clientId}`);

      ws.on('message', async (message) => {
        try {
          const messageStr = message.toString();
          console.log(`[WS] Raw message from ${clientId}:`, messageStr);
          const data = JSON.parse(messageStr);

          // Original auth logic
          if (data.type === 'auth' && data.userId) {
            this.clients.set(data.userId, ws);
            if (data.role === 'admin' || data.role === 'superadmin' || data.role === 'technical_support') {
              this.clients.set(`admin_${data.userId}`, ws);
            }
          }

          // New Chat Logic
          if (data.type === 'chat_join' && data.chatId) {
            console.log(`[WS] Client ${clientId} joining chat room: ${data.chatId}`);
            if (!this.chatClients.has(data.chatId)) {
              this.chatClients.set(data.chatId, new Set());
            }
            this.chatClients.get(data.chatId).add(ws);
            // Confirm join
            ws.send(JSON.stringify({ type: 'system', content: 'You have joined the secure chat session.' }));
          }

          if (data.type === 'chat_message' && data.chatId) {
            console.log(`[WS] Processing chat_message in ${data.chatId}`);
            await this.handleChatMessage(data, ws);
          }

          if (data.type === 'chat_read' && data.chatId) {
            console.log(`[WS] Marking chat as read for ${data.chatId}`);
            // Reset unread count for the person who read it
            await SupportChat.findByIdAndUpdate(data.chatId, {
              $set: { [`unreadCount.${data.sender === 'admin' ? 'admin' : 'user'}`]: 0 }
            });
            await SupportMessage.updateMany(
              { chatId: data.chatId, sender: data.sender === 'admin' ? 'user' : 'admin', read: false },
              { $set: { read: true, readAt: new Date() } }
            );
            // Broadcast the read status
            this.broadcastToChat(data.chatId, { type: 'chat_read_update', chatId: data.chatId });
          }

          if (data.type === 'chat_call_request' && data.chatId) {
            console.log(`[WS] Call requested for chat ${data.chatId} by ${data.sender}`);
            this.broadcastToChat(data.chatId, {
              type: 'chat_call_request',
              chatId: data.chatId,
              callType: data.callType || 'audio',
              sender: data.sender
            });
            if (data.sender === 'user') {
              this.notifyAdmins({
                type: 'admin_call_alert',
                title: 'Incoming Call Request',
                message: `User in chat ${data.chatId} is requesting a ${data.callType || 'audio'} call.`,
                chatId: data.chatId
              });
            }
          }

          if (data.type === 'chat_call_response' && data.chatId) {
            console.log(`[WS] Call response for chat ${data.chatId}: ${data.status}`);
            
            // 1. Save system message to history
            const content = data.status === 'accepted' 
                ? "Agent accepted the call. Connecting shortly..." 
                : "Agent is currently busy. Please continue via chat.";
                
            const systemMsg = await SupportMessage.create({
                chatId: data.chatId,
                sender: 'system',
                content,
                read: true
            });

            // Update chat session
            await SupportChat.findByIdAndUpdate(data.chatId, { lastMessageAt: new Date() });

            // 2. Broadcast the response + the system message
            this.broadcastToChat(data.chatId, {
                type: 'chat_call_response',
                chatId: data.chatId,
                status: data.status,
                message: systemMsg
            });

            // 3. Clear alerts for all admins globally
            this.notifyAdmins({
                type: 'chat_call_response',
                chatId: data.chatId,
                status: data.status,
                action: 'clear_alert'
            });
          }

          if (data.type === 'chat_typing' && data.chatId) {
            this.broadcastToChat(data.chatId, {
              type: 'chat_typing',
              chatId: data.chatId,
              sender: data.sender,
              isTyping: data.isTyping
            }, ws);
          }

        } catch (error) {
          console.error('[WS] Message processing error:', error);
        }
      });

      ws.on('close', () => {
        console.log(`[WS] Client disconnected: ${clientId}`);
        this.clients.delete(clientId);
        this.chatClients.forEach((wsSet, chatId) => {
          wsSet.delete(ws);
        });
      });

      // Send initial welcome
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to Moksha Sewa notifications',
        timestamp: new Date().toISOString()
      }));
    });
  }

  async handleChatMessage(data, senderWs) {
    try {
      const { chatId, sender, content, adminId } = data;
      console.log(`[WS] Message from ${sender} in chat ${chatId}`);

      // 1. Save to Database
      const newMessage = await SupportMessage.create({
        chatId,
        sender,
        content,
        adminId: sender === 'admin' ? adminId : null
      });

      // 2. Update Chat session
      const updateData = { lastMessageAt: new Date() };
      if (sender === 'user') {
        updateData.$inc = { 'unreadCount.admin': 1 };
      } else {
        updateData.$inc = { 'unreadCount.user': 1 };
      }

      await SupportChat.findByIdAndUpdate(chatId, updateData);

      // 3. Prepare payload
      const payload = {
        type: 'chat_message',
        chatId,
        message: newMessage,
        timestamp: new Date().toISOString()
      };

      // 4. Send to all participants in this chat
      this.broadcastToChat(chatId, payload);
      console.log(`[WS] Broadcast completed for chat ${chatId}`);

      // 5. Notify all admins if user sends a message
      if (sender === 'user') {
        this.notifyAdmins({
          type: 'new_chat_message',
          title: 'New Message',
          message: `From ${data.userName || 'User'}: ${content.substring(0, 30)}...`,
          chatId
        });
      }
    } catch (err) {
      console.error('[WS] Error handling chat message:', err);
    }
  }

  broadcastToChat(chatId, payload, excludeWs = null) {
    const wsSet = this.chatClients.get(chatId);
    if (wsSet) {
      const message = JSON.stringify(payload);
      wsSet.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  notifyAdmins(notification) {
    this.clients.forEach((ws, id) => {
      if (id.toString().startsWith('admin_') && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          ...notification,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

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

  async sendNotification(options) {
    const { userId, email, type, title, message, data = {}, sendEmail = false, emailTemplate = null } = options;
    if (userId) this.sendToUser(userId, { type, title, message, data });
    if (sendEmail && email && emailTemplate) await this.sendEmailNotification(emailTemplate, email, data);
  }

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
      userId, email, type: 'status_update', title: 'Application Status Updated',
      message: `Your ${type} status has been updated to: ${status}`,
      data: { type, status, ...data }, sendEmail: true, emailTemplate: 'statusUpdate'
    });
  }

  async notifyAdminAlert(priority, title, message, data = {}) {
    this.broadcast({ type: 'admin_alert', priority, title, message, data });
  }
}

module.exports = new NotificationService();
