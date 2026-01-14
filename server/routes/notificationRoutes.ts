import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getTrashedNotifications,
  restoreNotification,
  forceDeleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateResource.js';
import { createNotificationSchema } from '../schemas/notificationSchema.js';

const router = express.Router();

router.get('/trash', protect, getTrashedNotifications);

router.route('/')
  .get(protect, getNotifications)
  .post(protect, validate(createNotificationSchema), createNotification);

router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);
router.put('/:id/restore', protect, restoreNotification);
router.delete('/:id/force', protect, forceDeleteNotification);

export default router;