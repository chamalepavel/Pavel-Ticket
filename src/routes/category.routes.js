import { Router } from 'express';
import {
    createCategory,
    getAllCategories,
    getActiveCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from '../controllers/category.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/active', getActiveCategories);
router.get('/:id', getCategoryById);
router.get('/', getAllCategories);

// Admin only routes
router.post('/', authenticate, isAdmin, createCategory);
router.put('/:id', authenticate, isAdmin, updateCategory);
router.delete('/:id', authenticate, isAdmin, deleteCategory);
router.patch('/:id/toggle-status', authenticate, isAdmin, toggleCategoryStatus);

export default router;
