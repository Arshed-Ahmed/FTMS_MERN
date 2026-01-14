import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, createNotification, } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.route('/')
    .get(protect, getNotifications)
    .post(protect, createNotification);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
export default router;
