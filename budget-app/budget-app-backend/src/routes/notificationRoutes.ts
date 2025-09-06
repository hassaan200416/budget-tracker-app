/**
 * Notification routes
 *
 * Protected endpoints for listing notifications and updating read status.
 */
import express from 'express';
import {
  getUserNotifications,
  createNotification,
  markAllNotificationsAsRead
} from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', getUserNotifications);

// POST /api/notifications - Create a new notification
router.post('/', createNotification);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

export default router;
