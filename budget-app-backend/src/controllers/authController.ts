/**
 * Auth controller
 *
 * Handles signup and login. Password hashing is managed by the User model
 * pre-save hook; tokens include user id and role with a short expiry.
 */
import express from 'express';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import expressAsyncHandler = require('express-async-handler'); // Updated import
import { Request, Response } from 'express';

dotenv.config();

/**
 * Issues a signed JWT used by the frontend for subsequent authenticated calls.
 */
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export const signup = expressAsyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, budgetLimit } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json({ message: 'An account already exists with this email' });
    return;
  }

  const user = new User({ firstName, lastName, email, password, budgetLimit });
  await user.save();

  const token = generateToken(user._id.toString(), user.role);
  res.status(201).json({ 
    message: 'User created successfully', 
    token, 
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      budgetLimit: user.budgetLimit,
      role: user.role
    },
    redirect: '/dashboard' 
  });
});

export const login = expressAsyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(400).json({ message: 'Invalid credentials' });
    return;
  }

  const token = generateToken(user._id.toString(), user.role);
  res.json({ 
    message: 'Login successful', 
    token, 
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      budgetLimit: user.budgetLimit,
      role: user.role
    },
    redirect: '/dashboard' 
  });
});

// Profile handlers moved to profileController