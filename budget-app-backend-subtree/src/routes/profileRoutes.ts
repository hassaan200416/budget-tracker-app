/**
 * Profile routes
 *
 * Read/update endpoints for the authenticated user's profile.
 */
import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
// For image upload, the frontend PUTs JSON with profileImageUrl (URL or base64)

export default router;


