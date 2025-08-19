import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', getUserNotifications);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', markNotificationAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', getUnreadNotificationCount);

export default router;
