/**
 * MongoDB connection helper
 *
 * Encapsulates the initial Mongoose connection and ensures the process exits
 * if a connection cannot be established (to avoid running a half-broken API).
 */
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not defined');
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);//prevents the server from starting without a database.
  }
};

export default connectDB;