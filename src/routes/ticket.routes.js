import { Router } from 'express';
import {
    purchaseTicket,
    getUserTickets,
    getTicketById,
    cancelTicket,
    getAllTickets,
    markTicketAsUsed,
    verifyTicket
} from '../controllers/ticket.controller.js';
import { authenticate, isAdmin, isAdminOrOrganizer } from '../middleware/auth.middleware.js';

const router = Router();

// Public route (verify ticket by code)
router.get('/verify/:unique_code', verifyTicket);

// Protected routes (authenticated users)
router.post('/purchase/:eventid', authenticate, purchaseTicket);
router.get('/my-tickets', authenticate, getUserTickets);
router.get('/:id', authenticate, getTicketById);
router.patch('/:id/cancel', authenticate, cancelTicket);

// Admin/Organizer routes
router.get('/', authenticate, isAdmin, getAllTickets);
router.patch('/:id/mark-used', authenticate, isAdminOrOrganizer, markTicketAsUsed);

export default router;
