import express from 'express';
import Notification, { INotification } from '../models/Notification';
import expressAsyncHandler = require('express-async-handler');
import { Request, Response } from 'express';

// Extend Request to include user info from auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Get all notifications for a user
export const getUserNotifications = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications

  res.json(notifications);
});

// Mark a notification as read
export const markNotificationAsRead = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404).json({ message: 'Notification not found' });
    return;
  }

  res.json({ message: 'Notification marked as read', notification });
});

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const result = await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.json({ 
    message: 'All notifications marked as read', 
    updatedCount: result.modifiedCount 
  });
});

// Get notification count for unread notifications
export const getUnreadNotificationCount = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const count = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false
  });

  res.json({ unreadCount: count });
});
