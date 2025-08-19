import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  type: 'add' | 'edit' | 'delete';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['add', 'edit', 'delete'], 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries by user and read status
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
