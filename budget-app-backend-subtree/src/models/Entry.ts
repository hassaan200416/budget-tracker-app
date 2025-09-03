/**
 * Entry model
 *
 * Represents a single expense entry, linked to a user. Adds createdAt/updatedAt
 * timestamps and indexes userId for efficient per-user queries.
 */
import mongoose, { Document, Schema } from 'mongoose';

export interface IEntry extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  date: string;
  user: string;
  createdAt: Date;
  updatedAt: Date;
}

// Links entries to the user who created them
const entrySchema: Schema<IEntry> = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  date: { 
    type: String, 
    required: true 
  },
  user: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Basic indexes for essential queries
entrySchema.index({ userId: 1 }); // For user-specific queries
entrySchema.index({ userId: 1, date: 1 }); // For user + date filtering

export default mongoose.model<IEntry>('Entry', entrySchema);
