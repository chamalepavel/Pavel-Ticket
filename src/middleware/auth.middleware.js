import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/jwt.js';
import { User, Role } from '../models/index.model.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticate = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        throw new ApiError(401, 'Access denied. No token provided.');
    }

    try {
        const decoded = verifyToken(token);
        
        const user = await User.findByPk(decoded.userid, {
            include: [{
                model: Role,
                as: 'role',
                attributes: ['role_id', 'name']
            }],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        if (!user.is_active) {
            throw new ApiError(403, 'User account is inactive');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, 'Invalid token');
    }
});

/**
 * Middleware to check if user has required role
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, 'Not authenticated');
        }

        const userRole = req.user.role?.name;

        if (!roles.includes(userRole)) {
            throw new ApiError(403, 'Access denied. Insufficient permissions.');
        }

        next();
    });
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Middleware to check if user is admin (organizer role removed, only admin can create/manage events)
 */
export const isAdminOrOrganizer = authorize('admin');
