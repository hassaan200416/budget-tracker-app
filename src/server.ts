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

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:3005', // Local development
  'https://budget-app-frontend-pc14-97de7ctoc-hassaan-raheels-projects.vercel.app', // Vercel frontend
];

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
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