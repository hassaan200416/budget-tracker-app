/**
 * User model
 *
 * Stores authentication info and profile details. Passwords are hashed via a
 * pre-save hook. Includes a method for verifying a plaintext password.
 */
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly include _id
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  budgetLimit: number;
  role: string;
  profileImageUrl?: string;
  jobTitle?: string;
  phoneNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  completeAddress?: string;
  dateOfBirth?: string;
  education?: string;
  gender?: string;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  budgetLimit: { type: Number, required: true, min: 0 },
  role: { type: String, default: 'user' },
  profileImageUrl: { type: String },
  jobTitle: { type: String },
  phoneNumber: { type: String },
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  completeAddress: { type: String },
  dateOfBirth: { type: String },
  education: { type: String },
  gender: { type: String }
});

// Hash password if it was changed before saving
userSchema.pre<IUser>('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare a candidate password with the stored hash
userSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', userSchema);