import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    createUser,
    deleteUser,
    getSalesReport,
    getAttendeesReport,
    updateEventSales,
    resetEventSales
} from '../controllers/admin.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:userid/role', updateUserRole);
router.patch('/users/:userid/toggle-status', toggleUserStatus);
router.delete('/users/:userid', deleteUser);

// Reports
router.get('/reports/sales', getSalesReport);
router.get('/reports/attendees/:eventid', getAttendeesReport);

// Event sales management
router.patch('/events/:eventid/sales', updateEventSales);
router.patch('/events/:eventid/reset-sales', resetEventSales);

export default router;
