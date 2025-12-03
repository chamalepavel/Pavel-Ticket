import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Role, Ticket, Event, Category } from '../models/index.model.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';

/**
 * Get user by ID (Public - basic info only)
 */
export const getUserById = asyncHandler(async (req, res) => {
    const { userid } = req.params;

    const user = await User.findByPk(userid, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }],
        attributes: ['userid', 'name', 'email', 'created_at']
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    return res.status(200).json(
        new ApiResponse(200, user, 'User retrieved successfully')
    );
});

/**
 * Get user's events history (tickets purchased)
 */
export const getUserEventsHistory = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const userid = req.user.userid;
    const { status } = req.query;

    const whereClause = { userid };
    if (status) whereClause.status = status;

    const { count, rows: tickets } = await Ticket.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['purchase_date', 'DESC']],
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title', 'description', 'event_date', 'location', 'price', 'image_url'],
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: ['category_id', 'name']
                }]
            }
        ]
    });

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { tickets, pagination }, 'User events history retrieved successfully')
    );
});
