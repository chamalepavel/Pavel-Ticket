import { Router } from 'express';
import { getUserById, getUserEventsHistory } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public route
router.get('/:userid', getUserById);

// Protected routes
router.get('/:userid/events-history', authenticate, getUserEventsHistory);

export default router;
