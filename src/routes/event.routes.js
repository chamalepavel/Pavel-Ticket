import { Router } from 'express';
import {
    createEvent,
    getAllEvents,
    getFeaturedEvents,
    getEventDetails,
    getUpcomingEvents,
    eventStats,
    updateEvent,
    deleteEvent,
    toggleEventStatus
} from '../controllers/event.controller.js';
import { authenticate, isAdminOrOrganizer } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// Public routes
router.get('/featured', getFeaturedEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:eventid/details', getEventDetails);
router.get('/:eventid/stats', eventStats);
router.get('/:eventid', getEventDetails); // Added for direct access
router.get('/', getAllEvents);

// Protected routes (Admin/Organizer only)
router.post('/', authenticate, isAdminOrOrganizer, upload.single('image'), createEvent);
router.put('/:eventid', authenticate, isAdminOrOrganizer, upload.single('image'), updateEvent);
router.delete('/:eventid', authenticate, isAdminOrOrganizer, deleteEvent);
router.patch('/:eventid/toggle-status', authenticate, isAdminOrOrganizer, toggleEventStatus);

export default router;
