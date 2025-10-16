import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/index.model.js';

// Controller to register a new user
const userRegister = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        throw new ApiError(400, 'Missing required fields: name and email');
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
        throw new ApiError(400, 'Invalid name');
    }

    if (typeof email !== 'string' || email.trim().length === 0) {
        throw new ApiError(400, 'Invalid email');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, 'Invalid email format');
    }

    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
        throw new ApiError(409, 'Email is already registered');
    }

    const newUser = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
    });

    return res.status(201).json(
        new ApiResponse(201, newUser, 'User registered successfully')
    );
});

export {
    userRegister,
};