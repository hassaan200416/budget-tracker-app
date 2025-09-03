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
const allowedOrigins = new Set([
  'http://localhost:3005',
  'http://localhost:5173',
  'https://budget-app-frontend-3m7bd7int-hassaan-raheels-projects.vercel.app',
  'https://budget-app-frontend-jet.vercel.app',
]);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin
    if (!origin) return callback(null, true);
    // Allow explicit allowlist and Vercel preview/prod domains
    if (allowedOrigins.has(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'budget-app-backend', docs: '/api' });
});
app.get('/api', (_req, res) => {
  res.json({ message: 'Budget App API. Use /signup, /login, /entries, /notifications, /profile' });
});
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;


