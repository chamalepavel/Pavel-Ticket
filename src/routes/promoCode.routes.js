import express from 'express';
import {
    createPromoCode,
    getAllPromoCodes,
    getPromoCode,
    validatePromoCode,
    updatePromoCode,
    deletePromoCode,
    deactivatePromoCode
} from '../controllers/promoCode.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/validate/:code', validatePromoCode);

// Rutas protegidas - Solo admin
router.use(authenticate, isAdmin);

router.post('/', createPromoCode);
router.get('/', getAllPromoCodes);
router.get('/:id', getPromoCode);
router.put('/:id', updatePromoCode);
router.delete('/:id', deletePromoCode);
router.patch('/:id/deactivate', deactivatePromoCode);

export default router;
