/**
 * Auth routes
 *
 * Public endpoints for signup and login. Token-based auth protects other routes.
 */
import express from 'express';
import { signup, login } from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

export default router;
