import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Role } from '../models/index.model.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
        throw new ApiError(400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default user role
    const userRole = await Role.findOne({ where: { name: 'user' } });
    if (!userRole) {
        throw new ApiError(500, 'Default user role not found. Please seed roles first.');
    }

    // Create new user
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role_id: userRole.role_id
    });

    // Generate token
    const token = generateToken({
        userid: newUser.userid,
        email: newUser.email,
        role_id: newUser.role_id
    });

    // Remove password from response
    const userResponse = {
        userid: newUser.userid,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: newUser.role_id,
        is_active: newUser.is_active,
        created_at: newUser.created_at
    };

    return res.status(201).json(
        new ApiResponse(201, { user: userResponse, token }, 'User registered successfully')
    );
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required');
    }

    // Find user with role
    const user = await User.findOne({
        where: { email },
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }]
    });

    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
        throw new ApiError(403, 'Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken({
        userid: user.userid,
        email: user.email,
        role_id: user.role_id
    });

    // Remove password from response
    const userResponse = {
        userid: user.userid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        role: user.role,
        is_active: user.is_active
    };

    return res.status(200).json(
        new ApiResponse(200, { user: userResponse, token }, 'Login successful')
    );
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.userid, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name', 'description']
        }],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
        new ApiResponse(200, user, 'Profile retrieved successfully')
    );
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const userId = req.user.userid;

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    // Get updated user without password
    const updatedUser = await User.findByPk(userId, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }],
        attributes: { exclude: ['password'] }
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, 'Profile updated successfully')
    );
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userid;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    const user = await User.findByPk(userId);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, null, 'Password changed successfully')
    );
});

/**
 * Get current user (me endpoint)
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.userid, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name', 'description']
        }],
        attributes: { exclude: ['password'] }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
        new ApiResponse(200, user, 'Current user retrieved successfully')
    );
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req, res) => {
    // In JWT-based auth, logout is typically handled client-side by removing the token
    // But we can still provide an endpoint for consistency
    return res.status(200).json(
        new ApiResponse(200, null, 'Logout successful')
    );
});
