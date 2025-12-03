import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Event, User, Registration, Category, Ticket } from '../models/index.model.js';
import { Op, Sequelize } from 'sequelize';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import { deleteUploadedFile } from '../middleware/upload.middleware.js';

/**
 * Create a new event (Admin/Organizer only)
 */
export const createEvent = asyncHandler(async (req, res) => {
    const { title, description, event_date, location, capacity, category_id, price, is_featured } = req.body;
    const organizer_id = req.user.userid;

    if (!title || !event_date || !location || capacity === undefined) {
        throw new ApiError(400, 'Missing required fields: title, event_date, location, capacity');
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
        throw new ApiError(400, 'Invalid title');
    }

    const eventDateObj = new Date(event_date);
    if (isNaN(eventDateObj.getTime())) {
        throw new ApiError(400, 'Invalid or malformed event_date');
    }
    if (eventDateObj <= new Date()) {
        throw new ApiError(400, 'event_date must be in the future');
    }

    if (typeof location !== 'string' || location.trim().length === 0) {
        throw new ApiError(400, 'Invalid location');
    }

    if (!Number.isInteger(Number(capacity)) || capacity < 1 || capacity > 10000) {
        throw new ApiError(400, 'capacity must be an integer between 1 and 10000');
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
        image_url = `/uploads/events/${req.file.filename}`;
    }

    const newEvent = await Event.create({
        title: title.trim(),
        description: description?.trim(),
        event_date: eventDateObj,
        location: location.trim(),
        capacity: Number(capacity),
        category_id: category_id || null,
        image_url,
        price: price || 0,
        is_featured: is_featured || false,
        organizer_id
    });

    // Fetch complete event data
    const eventData = await Event.findByPk(newEvent.eventid, {
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            },
            {
                model: User,
                as: 'organizer',
                attributes: ['userid', 'name', 'email']
            }
        ]
    });

    return res.status(201).json(
        new ApiResponse(201, eventData, 'Event created successfully')
    );
});

/**
 * Get all events with pagination and advanced filtering
 */
export const getAllEvents = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { category_id, location, min_price, max_price, date_from, date_to, search, is_featured, is_active } = req.query;

    const whereClause = {};

    // Advanced filtering
    if (category_id) whereClause.category_id = category_id;
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';

    // Price range filter
    if (min_price !== undefined || max_price !== undefined) {
        whereClause.price = {};
        if (min_price !== undefined) whereClause.price[Op.gte] = Number(min_price);
        if (max_price !== undefined) whereClause.price[Op.lte] = Number(max_price);
    }

    // Date range filter
    if (date_from || date_to) {
        whereClause.event_date = {};
        if (date_from) whereClause.event_date[Op.gte] = new Date(date_from);
        if (date_to) whereClause.event_date[Op.lte] = new Date(date_to);
    }

    // Search filter (title or description)
    if (search) {
        whereClause[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows: events } = await Event.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['event_date', 'ASC']],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            },
            {
                model: User,
                as: 'organizer',
                attributes: ['userid', 'name']
            }
        ],
        distinct: true
    });

    // Add ticket count to each event
    const eventsWithTicketCount = await Promise.all(
        events.map(async (event) => {
            const ticketCount = await Ticket.count({
                where: { eventid: event.eventid, status: 'active' }
            });
            return {
                ...event.toJSON(),
                tickets_sold: ticketCount,
                available_capacity: event.capacity - ticketCount
            };
        })
    );

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { events: eventsWithTicketCount, pagination }, 'Events retrieved successfully')
    );
});

/**
 * Get featured events
 */
export const getFeaturedEvents = asyncHandler(async (req, res) => {
    const { limit } = req.query;
    const eventLimit = limit ? parseInt(limit) : 6;

    const events = await Event.findAll({
        where: {
            is_featured: true,
            is_active: true,
            event_date: { [Op.gt]: new Date() }
        },
        limit: eventLimit,
        order: [['event_date', 'ASC']],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            }
        ]
    });

    // Add ticket count
    const eventsWithTicketCount = await Promise.all(
        events.map(async (event) => {
            const ticketCount = await Ticket.count({
                where: { eventid: event.eventid, status: 'active' }
            });
            return {
                ...event.toJSON(),
                tickets_sold: ticketCount,
                available_capacity: event.capacity - ticketCount
            };
        })
    );

    return res.status(200).json(
        new ApiResponse(200, eventsWithTicketCount, 'Featured events retrieved successfully')
    );
});

/**
 * Get event details by ID
 */
export const getEventDetails = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    if (!eventid) {
        throw new ApiError(400, 'Missing eventid parameter');
    }

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const event = await Event.findByPk(eventIdNum, {
        include: [
            {
                model: User,
                as: 'registered_users',
                through: {
                    model: Registration,
                    attributes: []
                },
                attributes: ['userid', 'name', 'email']
            },
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name', 'description']
            },
            {
                model: User,
                as: 'organizer',
                attributes: ['userid', 'name', 'email']
            }
        ]
    });

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    const registeredUsers = event.registered_users || [];
    const ticketsSold = await Ticket.count({
        where: { eventid: eventIdNum, status: 'active' }
    });

    const responseData = {
        ...event.toJSON(),
        registered_users_count: registeredUsers.length,
        tickets_sold: ticketsSold,
        available_capacity: event.capacity - ticketsSold
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, 'Event details retrieved successfully')
    );
});

/**
 * Get upcoming events
 */
export const getUpcomingEvents = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const currentDate = new Date();

    const { count, rows: events } = await Event.findAndCountAll({
        where: {
            event_date: { [Op.gt]: currentDate },
            is_active: true
        },
        limit,
        offset,
        order: [['event_date', 'ASC']],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            }
        ]
    });

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { events, pagination }, 'Upcoming events retrieved successfully')
    );
});

/**
 * Get event statistics
 */
export const eventStats = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    if (!eventid) {
        throw new ApiError(400, 'Missing eventid parameter');
    }

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const event = await Event.findByPk(eventIdNum);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Count tickets by status
    const activeTickets = await Ticket.count({ where: { eventid: eventIdNum, status: 'active' } });
    const usedTickets = await Ticket.count({ where: { eventid: eventIdNum, status: 'used' } });
    const cancelledTickets = await Ticket.count({ where: { eventid: eventIdNum, status: 'cancelled' } });
    const totalRegistrations = await Registration.count({ where: { eventid: eventIdNum } });

    const remainingCapacity = Math.max(event.capacity - activeTickets, 0);
    const percentageUsed = event.capacity > 0 ? (activeTickets / event.capacity) * 100 : 0;

    const data = {
        eventid: event.eventid,
        title: event.title,
        capacity: event.capacity,
        totalRegistrations,
        activeTickets,
        usedTickets,
        cancelledTickets,
        remainingCapacity,
        percentageUsed: Number(percentageUsed.toFixed(2)),
        totalRevenue: Number((activeTickets * parseFloat(event.price)).toFixed(2))
    };

    return res.status(200).json(
        new ApiResponse(200, data, 'Event statistics retrieved successfully')
    );
});

/**
 * Update event (Admin/Organizer only)
 */
export const updateEvent = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const { title, description, event_date, location, capacity, category_id, price, is_featured, is_active } = req.body;
    const userId = req.user.userid;
    const userRole = req.user.role?.name;

    const event = await Event.findByPk(eventid);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Check if user is the organizer or admin
    if (event.organizer_id !== userId && userRole !== 'admin') {
        throw new ApiError(403, 'You do not have permission to update this event');
    }

    // Update fields
    if (title) event.title = title.trim();
    if (description !== undefined) event.description = description?.trim();
    if (event_date) {
        const eventDateObj = new Date(event_date);
        if (isNaN(eventDateObj.getTime())) {
            throw new ApiError(400, 'Invalid event_date');
        }
        event.event_date = eventDateObj;
    }
    if (location) event.location = location.trim();
    if (capacity !== undefined) event.capacity = Number(capacity);
    if (category_id !== undefined) event.category_id = category_id || null;
    if (price !== undefined) event.price = price;
    if (is_featured !== undefined) event.is_featured = is_featured;
    if (is_active !== undefined) event.is_active = is_active;

    // Handle new image upload
    if (req.file) {
        // Delete old image if exists
        if (event.image_url) {
            const oldFilename = event.image_url.split('/').pop();
            deleteUploadedFile(oldFilename);
        }
        event.image_url = `/uploads/events/${req.file.filename}`;
    }

    await event.save();

    // Fetch updated event with relations
    const updatedEvent = await Event.findByPk(eventid, {
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            },
            {
                model: User,
                as: 'organizer',
                attributes: ['userid', 'name']
            }
        ]
    });

    return res.status(200).json(
        new ApiResponse(200, updatedEvent, 'Event updated successfully')
    );
});

/**
 * Delete event (Admin/Organizer only)
 */
export const deleteEvent = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const userId = req.user.userid;
    const userRole = req.user.role?.name;

    const event = await Event.findByPk(eventid);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Check if user is the organizer or admin
    if (event.organizer_id !== userId && userRole !== 'admin') {
        throw new ApiError(403, 'You do not have permission to delete this event');
    }

    // Check if event has tickets sold
    const ticketCount = await Ticket.count({ where: { eventid, status: 'active' } });
    if (ticketCount > 0) {
        throw new ApiError(400, `Cannot delete event. It has ${ticketCount} active tickets. Consider deactivating instead.`);
    }

    // Delete image if exists
    if (event.image_url) {
        const filename = event.image_url.split('/').pop();
        deleteUploadedFile(filename);
    }

    await event.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, 'Event deleted successfully')
    );
});

/**
 * Toggle event active status (Admin/Organizer only)
 */
export const toggleEventStatus = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const userId = req.user.userid;
    const userRole = req.user.role?.name;

    const event = await Event.findByPk(eventid);

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Check if user is the organizer or admin
    if (event.organizer_id !== userId && userRole !== 'admin') {
        throw new ApiError(403, 'You do not have permission to modify this event');
    }

    event.is_active = !event.is_active;
    await event.save();

    return res.status(200).json(
        new ApiResponse(200, event, `Event ${event.is_active ? 'activated' : 'deactivated'} successfully`)
    );
});
