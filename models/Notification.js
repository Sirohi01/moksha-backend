const mongoose = require('mongoose');

/**
 * MOKSHA NOTIFICATION SYSTEM
 * Tracks all administrative signals including donations, messages, 
 * activity updates, and security alerts.
 */

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['donation', 'chat', 'form', 'activity', 'security', 'whatsapp'],
        default: 'activity'
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    link: {
        type: String
    },
    sourceId: {
        type: String // To link to actual record (e.g. Donation ID)
    },
    recipientGroups: [{
        type: String // Roles allowed to see this
    }],
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Indexing for faster cleanup and read status
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
