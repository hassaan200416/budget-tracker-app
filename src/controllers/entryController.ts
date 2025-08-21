/**
 * Entry controller
 *
 * CRUD endpoints for expense entries with budget checks and notification side effects.
 * Transforms DB documents to a frontend-friendly shape.
 */
import express from 'express';
import mongoose from 'mongoose';
import Entry, { IEntry } from '../models/Entry';
import User from '../models/User';
import Notification from '../models/Notification';
import expressAsyncHandler = require('express-async-handler');
import { Request, Response } from 'express';

// Extend Request to include user info from auth middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Get paginated entries for a user with search and filtering
export const getUserEntries = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  // Extract pagination and filter parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;
  const search = req.query.search as string || '';
  const dateFilter = req.query.dateFilter as string || '';
  const sortBy = req.query.sortBy as string || 'all';

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build query object
  const query: any = { userId: req.user.id };

  // Add search filter
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Add date filter
  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.date = {
      $gte: filterDate.toISOString().split('T')[0],
      $lt: nextDay.toISOString().split('T')[0]
    };
  }

  // Build sort object
  let sort: any = {};
  switch (sortBy) {
    case 'price-high-low':
      sort = { price: -1 };
      break;
    case 'price-low-high':
      sort = { price: 1 };
      break;
    case 'date-new-old':
      sort = { date: -1 };
      break;
    case 'date-old-new':
      sort = { date: 1 };
      break;
    case 'all':
      // No sorting applied - use natural order
      sort = {};
      break;
    default:
      // Default to no sorting for unknown values
      sort = {};
  }

  // Get total count for pagination
  const totalEntries = await Entry.countDocuments(query);

  // Get paginated entries
  const entries = await Entry.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  // Transform entries to match frontend expectations
  const transformedEntries = entries.map(entry => ({
    id: entry._id.toString(),
    title: entry.title,
    price: entry.price,
    date: entry.date,
    user: entry.user
  }));

  // Calculate pagination info
  const totalPages = Math.ceil(totalEntries / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json({
    entries: transformedEntries,
    pagination: {
      currentPage: page,
      totalPages,
      totalEntries,
      hasNextPage,
      hasPrevPage,
      limit
    }
  });
});

// Add new entry
/**
 * Creates a new entry for the authenticated user. Rejects when the new total
 * would exceed the user's budget. Also creates a notification.
 */
export const addEntry = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { title, price, date } = req.body;
  
  // Ensure price is a number
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    res.status(400).json({ message: 'Invalid price value' });
    return;
  }

  // Get user's budget limit
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Calculate total expenses for the user
  const totalExpenses = await Entry.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: null, total: { $sum: '$price' } } }
  ]);

  const currentTotal = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
  
  // Check if adding this expense would exceed budget limit
  if (currentTotal + numericPrice > user.budgetLimit) {
    res.status(400).json({ 
      message: 'Budget limit exceeded',
      currentTotal,
      budgetLimit: user.budgetLimit,
      attemptedAmount: numericPrice
    });
    return;
  }

  // Create the entry
  const entry = new Entry({
    userId: req.user.id,
    title,
    price: numericPrice,
    date,
    user: `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`
  });

  await entry.save();

  // Create notification
  const notification = new Notification({
    userId: req.user.id,
    message: `${title} added successfully.`,
    type: 'add'
  });
  await notification.save();

  // Transform entry to match frontend expectations
  const entryResponse = {
    id: entry._id.toString(),
    title: entry.title,
    price: entry.price,
    date: entry.date,
    user: entry.user
  };

  res.status(201).json(entryResponse);
});

// Update entry
/**
 * Updates an existing entry owned by the user. Validates ID, preserves ownership,
 * enforces budget limit, and emits an 'edit' notification.
 */
export const updateEntry = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { id } = req.params;
  const { title, price, date } = req.body;
  
  // Ensure price is a number
  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    res.status(400).json({ message: 'Invalid price value' });
    return;
  }

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid entry ID' });
    return;
  }

  // Find the entry and verify ownership
  const entry = await Entry.findOne({ _id: new mongoose.Types.ObjectId(id), userId: req.user.id });
  if (!entry) {
    res.status(404).json({ message: 'Entry not found' });
    return;
  }

  // Get user's budget limit
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  // Calculate total expenses excluding the current entry
  const totalExpenses = await Entry.aggregate([
    { $match: { userId: user._id, _id: { $ne: entry._id } } },
    { $group: { _id: null, total: { $sum: '$price' } } }
  ]);

  const currentTotal = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
  
  // Check if updating this expense would exceed budget limit
  if (currentTotal + numericPrice > user.budgetLimit) {
    res.status(400).json({ 
      message: 'Budget limit exceeded',
      currentTotal,
      budgetLimit: user.budgetLimit,
      attemptedAmount: numericPrice
    });
    return;
  }

  // Update the entry
  entry.title = title;
  entry.price = numericPrice;
  entry.date = date;
  entry.user = `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`;

  await entry.save();

  // Create notification
  const notification = new Notification({
    userId: req.user.id,
    message: `${title} updated successfully.`,
    type: 'edit'
  });
  await notification.save();

  // Transform entry to match frontend expectations
  const entryResponse = {
    id: entry._id.toString(),
    title: entry.title,
    price: entry.price,
    date: entry.date,
    user: entry.user
  };

  res.json(entryResponse);
});

// Delete entry
/**
 * Deletes an entry owned by the user and emits a 'delete' notification.
 */
export const deleteEntry = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid entry ID' });
    return;
  }

  // Find the entry and verify ownership
  const entry = await Entry.findOne({ _id: new mongoose.Types.ObjectId(id), userId: req.user.id });
  if (!entry) {
    res.status(404).json({ message: 'Entry not found' });
    return;
  }

  // Create notification before deleting
  const notification = new Notification({
    userId: req.user.id,
    message: `${entry.title} removed successfully.`,
    type: 'delete'
  });
  await notification.save();

  // Delete the entry
  await Entry.findByIdAndDelete(new mongoose.Types.ObjectId(id));

  res.json({ 
    message: 'Entry deleted successfully'
  });
});

// Get budget analysis data for charts
/**
 * Computes aggregated spend vs. monthly budget and, for last-month, daily breakdowns.
 * Returns a compact structure that the frontend charts can directly consume.
 */
export const getBudgetAnalysis = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }

  const { range = 'last-12-months' } = req.query;
  console.log('Budget analysis requested for range:', range);
  
  // Get user's budget limit
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  console.log('User found:', user.firstName, 'Budget limit:', user.budgetLimit);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calculate date range based on filter
  let startDate: Date;
  let endDate: Date;

  switch (range) {
    case 'last-month': {
      // Previous calendar month
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      startDate = new Date(prevMonthYear, prevMonth, 1);
      endDate = new Date(prevMonthYear, prevMonth + 1, 0);
      break;
    }
    case 'last-6-months':
      startDate = new Date(currentYear, currentMonth - 5, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    case 'last-12-months':
      startDate = new Date(currentYear, currentMonth - 11, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;
    default:
      startDate = new Date(currentYear, currentMonth - 11, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
  }

  console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

  // Format dates for MongoDB query (YYYY-MM-DD format)
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  console.log('Querying entries from', startDateStr, 'to', endDateStr);

  // Get entries in the computed date range
  const allEntries = await Entry.find({
    userId: user._id,
    date: {
      $gte: startDateStr,
      $lte: endDateStr
    }
  }).sort({ date: 1 });

  console.log('Found', allEntries.length, 'entries in date range');

  // Group expenses by month
  const monthlyExpenses = new Map<string, { year: number; month: number; totalExpenses: number }>();
  
  allEntries.forEach(entry => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = date.getMonth();
    const key = `${year}-${month}`;
    
    if (!monthlyExpenses.has(key)) {
      monthlyExpenses.set(key, {
        year,
        month,
        totalExpenses: 0
      });
    }
    
    monthlyExpenses.get(key)!.totalExpenses += entry.price;
  });

  console.log('Monthly expenses grouped:', Array.from(monthlyExpenses.entries()));

  // Calculate monthly budget limits
  const months: Array<{ year: number; month: number; monthName: string; totalExpenses: number; budgetLimit: number; exceeded: boolean; remaining: number }> = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const monthKey = `${year}-${month}`;
    
    // Find expenses for this month
    const monthExpense = monthlyExpenses.get(monthKey);
    const totalExpenses = monthExpense ? monthExpense.totalExpenses : 0;
    const budgetLimit = user.budgetLimit;
    const exceeded = totalExpenses > budgetLimit;
    
    months.push({
      year,
      month: month + 1, // MongoDB months are 0-indexed, but we want 1-indexed
      monthName: current.toLocaleString('default', { month: 'short' }),
      totalExpenses,
      budgetLimit,
      exceeded,
      remaining: budgetLimit - totalExpenses
    });
    
    current.setMonth(current.getMonth() + 1);
  }

  console.log('Generated', months.length, 'months of data');

  // If last-month, also build daily data for the previous month
  let days: Array<{ year: number; month: number; day: number; date: string; totalExpenses: number; budgetLimit: number; exceeded: boolean; remaining: number }> | undefined = undefined;

  if (range === 'last-month') {
    const daysInMonth = endDate.getDate();
    const dailyExpenses = new Map<string, number>();

    allEntries.forEach(entry => {
      const dateKey = new Date(entry.date).toISOString().split('T')[0];
      dailyExpenses.set(dateKey, (dailyExpenses.get(dateKey) || 0) + entry.price);
    });

    // For daily view, we still use the full monthly budget limit, not divided by days
    const monthlyBudget = user.budgetLimit;
    const d: Array<{ year: number; month: number; day: number; date: string; totalExpenses: number; budgetLimit: number; exceeded: boolean; remaining: number }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      const key = dateObj.toISOString().split('T')[0];
      const totalExpenses = dailyExpenses.get(key) || 0;
      // Compare daily expenses against the full monthly budget limit
      const exceeded = totalExpenses > monthlyBudget;
      d.push({
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        day,
        date: key,
        totalExpenses,
        budgetLimit: monthlyBudget,
        exceeded,
        remaining: monthlyBudget - totalExpenses,
      });
    }

    days = d;
  }

  const response = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      budgetLimit: user.budgetLimit
    },
    analysis: {
      range,
      months,
      ...(days ? { days } : {}),
      totalExpenses: months.reduce((sum, month) => sum + month.totalExpenses, 0),
      totalBudget: months.length * user.budgetLimit,
      overallExceeded: months.some(month => month.exceeded)
    }
  };

  console.log('Sending response with', response.analysis.months.length, 'months');
  res.json(response);
});
