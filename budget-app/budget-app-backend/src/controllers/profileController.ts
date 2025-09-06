/**
 * Profile controller
 *
 * Exposes read/update for the authenticated user's profile. Update supports
 * optional fields and clearing the profileImageUrl by sending null/undefined.
 */
import expressAsyncHandler = require('express-async-handler');
import { Request, Response } from 'express';
import User from '../models/User';

export const getProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  res.json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    budgetLimit: user.budgetLimit,
    role: user.role,
    profileImageUrl: (user as any).profileImageUrl,
    jobTitle: (user as any).jobTitle,
    phoneNumber: (user as any).phoneNumber,
    streetAddress: (user as any).streetAddress,
    city: (user as any).city,
    state: (user as any).state,
    zipCode: (user as any).zipCode,
    completeAddress: (user as any).completeAddress,
    dateOfBirth: (user as any).dateOfBirth,
    education: (user as any).education,
    gender: (user as any).gender
  });
});

export const updateProfile = expressAsyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { firstName, lastName, email, budgetLimit, jobTitle, phoneNumber, streetAddress, city, state, zipCode, completeAddress, dateOfBirth, education, gender, profileImageUrl } = req.body as any;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'An account already exists with this email' });
      return;
    }
    user.email = email;
  }

  if (typeof firstName === 'string') user.firstName = firstName;
  if (typeof lastName === 'string') user.lastName = lastName;
  if (typeof budgetLimit === 'number' && !Number.isNaN(budgetLimit)) user.budgetLimit = budgetLimit;
  if (typeof jobTitle === 'string') user.jobTitle = jobTitle;
  if (typeof phoneNumber === 'string') user.phoneNumber = phoneNumber;
  if (profileImageUrl === null || profileImageUrl === undefined) {
    user.profileImageUrl = undefined;
  } else if (typeof profileImageUrl === 'string') {
    user.profileImageUrl = profileImageUrl;
  }
  if (typeof streetAddress === 'string') user.streetAddress = streetAddress;
  if (typeof city === 'string') user.city = city;
  if (typeof state === 'string') user.state = state;
  if (typeof zipCode === 'string') user.zipCode = zipCode;
  if (typeof completeAddress === 'string') user.completeAddress = completeAddress;
  if (typeof dateOfBirth === 'string') user.dateOfBirth = dateOfBirth;
  if (typeof education === 'string') user.education = education;
  if (typeof gender === 'string') user.gender = gender;

  await user.save();

  res.json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    budgetLimit: user.budgetLimit,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    jobTitle: user.jobTitle,
    phoneNumber: user.phoneNumber,
    streetAddress: user.streetAddress,
    city: user.city,
    state: user.state,
    zipCode: user.zipCode,
    completeAddress: user.completeAddress,
    dateOfBirth: user.dateOfBirth,
    education: user.education,
    gender: user.gender
  });
});


