import Notification from '../models/Notification.js';
import asyncHandler from 'express-async-handler';
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit);
    res.json(notifications);
});
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
        if (!req.user || notification.recipient.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }
        notification.read = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    }
    else {
        res.status(404);
        throw new Error('Notification not found');
    }
});
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }
    await Notification.updateMany({ recipient: req.user._id, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read' });
});
// @desc    Create a notification (Internal/Admin)
// @route   POST /api/notifications
// @access  Private
const createNotification = asyncHandler(async (req, res) => {
    const { recipient, title, message, type, link } = req.body;
    const notification = await Notification.create({
        recipient,
        title,
        message,
        type,
        link,
    });
    res.status(201).json(notification);
});
export { getNotifications, markAsRead, markAllAsRead, createNotification, };
