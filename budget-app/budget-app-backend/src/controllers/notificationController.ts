/**
 * Notification controller
 *
 * Lightweight endpoints to fetch and mark all notifications as read
 * scoped to the authenticated user.
 */
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

// Create a new notification for a user
export const createNotification = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { message, type } = req.body;

  if (!message || !type) {
    res.status(400).json({ message: 'Message and type are required' });
    return;
  }

  const notification = new Notification({
    userId: req.user.id,
    message,
    type,
    isRead: false,
  });

  const savedNotification = await notification.save();
  res.status(201).json(savedNotification);
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

