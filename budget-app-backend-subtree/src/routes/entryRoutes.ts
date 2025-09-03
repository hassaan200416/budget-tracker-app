/**
 * Entry routes
 *
 * All routes are protected and map directly to controller methods. Note that
 * the analysis endpoint is declared before the :id route to avoid conflicts.
 */
import express from 'express';
import {
  getUserEntries,
  addEntry,
  updateEntry,
  deleteEntry,
  getBudgetAnalysis
} from '../controllers/entryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/entries - Get all entries for the authenticated user
router.get('/', getUserEntries);

// GET /api/entries/analysis - Get budget analysis data for charts (must come before :id route)
router.get('/analysis', getBudgetAnalysis);

// POST /api/entries - Add a new entry
router.post('/', addEntry);

// PUT /api/entries/:id - Update an entry
router.put('/:id', updateEntry);

// DELETE /api/entries/:id - Delete an entry
router.delete('/:id', deleteEntry);

export default router;
