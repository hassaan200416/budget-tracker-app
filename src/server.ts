import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login } from './controllers/authController';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3005', credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.post('/api/signup', signup);
app.post('/api/login', login);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));