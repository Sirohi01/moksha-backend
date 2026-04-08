const Notification = require('../models/Notification');

/**
 * MOKSHA NOTIFICATION CONTROLLER
 * Handles fetching, updating status, and cleaning up notifications.
 */

// Get all notifications for admin
exports.getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const unreadCount = await Notification.countDocuments({ status: 'unread' });

        res.status(200).json({
            success: true,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// Mark single notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        next(error);
    }
};

// Mark all as read
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ status: 'unread' }, { status: 'read' });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        next(error);
    }
};

// Delete single notification
exports.deleteNotification = async (req, res, next) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        next(error);
    }
};

// Clear all notifications
exports.clearAll = async (req, res, next) => {
    try {
        await Notification.deleteMany({});
        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
        next(error);
    }
};
