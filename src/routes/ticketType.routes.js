import express from 'express';
import {
    createTicketType,
    getEventTicketTypes,
    getTicketType,
    updateTicketType,
    deleteTicketType,
    checkAvailability
} from '../controllers/ticketType.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/event/:eventid', getEventTicketTypes);
router.get('/:id', getTicketType);
router.get('/:id/availability', checkAvailability);

// Rutas protegidas - Solo admin
router.use(authenticate, isAdmin);

router.post('/event/:eventid', createTicketType);
router.put('/:id', updateTicketType);
router.delete('/:id', deleteTicketType);

export default router;
