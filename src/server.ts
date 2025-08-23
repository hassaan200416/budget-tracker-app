/**
 * Express application bootstrap
 *
 * - Loads env vars and sets up core middleware (CORS, JSON body parsing)
 * - Connects to MongoDB
 * - Registers public and authenticated route modules
 * - On server start, clears notifications to keep demo data consistent
 */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import entryRoutes from './routes/entryRoutes';
import notificationRoutes from './routes/notificationRoutes';
import Notification from './models/Notification';//to clear notifications when server starts

dotenv.config();

const app = express();

// Allow the frontend dev server to call the API and include credentials
app.use(cors({ origin: 'http://localhost:3005', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Clear all notifications when server starts
    try {
      const result = await Notification.deleteMany({});
      console.log(`Server restart: Cleared ${result.deletedCount} notifications`);
    } catch (error) {
      console.error('Error clearing notifications on server start:', error);
    }
  })
  .catch((err) => console.log(err));

// Routes
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);

// Protected routes (require authentication)
app.use('/api/entries', entryRoutes);
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));