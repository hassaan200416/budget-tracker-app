/**
 * Express application (exported for both serverless and local dev)
 */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import entryRoutes from './routes/entryRoutes';
import notificationRoutes from './routes/notificationRoutes';
import Notification from './models/Notification';

dotenv.config();

const app = express();

// Allow the frontend (local dev and Vercel) to call the API and include credentials
app.use(cors({
  origin: [
    'http://localhost:3005',
    'https://budget-app-frontend-3m7bd7int-hassaan-raheels-projects.vercel.app',
    'https://budget-app-frontend-jet.vercel.app',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

let isDbConnected = false;
async function ensureDatabaseConnected() {
  if (isDbConnected) return;
  await mongoose.connect(process.env.MONGODB_URI!);
  isDbConnected = true;

  // Clear all notifications when server starts (once per cold start)
  try {
    const result = await Notification.deleteMany({});
    console.log(`Server start: Cleared ${result.deletedCount} notifications`);
  } catch (error) {
    console.error('Error clearing notifications on server start:', error);
  }
}

// Initiate connection eagerly; subsequent invocations are no-ops
ensureDatabaseConnected().catch((err) => console.error('MongoDB connect error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;


