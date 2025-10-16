import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Event, User, Registration } from '../models/index.model.js';
import { Op, Sequelize } from "sequelize";

// Controller to create a new event
const createEvent = asyncHandler(async (req, res) => {
    const { title, event_date, location, capacity } = req.body;

    if (!title || !event_date || !location || capacity === undefined) {
        throw new ApiError(400, 'Missing required fields');
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

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000) {
        throw new ApiError(400, 'capacity must be an integer between 1 and 1000');
    }

    const existingEvent = await Event.findOne({
        where: {
            title: title.trim(),
            event_date: eventDateObj,
        },
    });

    if (existingEvent) {
        throw new ApiError(400, "Event with the same title and date already exists");
    }

    const newEvent = await Event.create({
        title: title.trim(),
        event_date: eventDateObj,
        location: location.trim(),
        capacity,
    });

    return res.status(201).json(
        new ApiResponse(201, newEvent, 'Event created successfully')
    );
})

// Controller to get event details by eventid
const getEventDetails = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    if (!eventid) {
        throw new ApiError(400, 'Missing eventid parameter');
    }

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const event = await Event.findByPk(eventIdNum, {
        include: [{
            model: User,
            through: {
                model: Registration,
                attributes: [],
            },
            attributes: ['userid', 'name', 'email'],
        }]
    });

    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    const registeredUsers = event.Users || [];
    const responseData = {
        eventid: event.eventid,
        title: event.title,
        event_date: event.event_date,
        location: event.location,
        capacity: event.capacity,
        created_at: event.created_at,
        registered_users_count: registeredUsers.length,
        registered_users: registeredUsers,
    };

    return res.status(200).json(
        new ApiResponse(200, responseData, 'Event details with registered users retrieved successfully')
    );
});

// Controller to get all upcoming events
const getUpcomingEvents = asyncHandler(async (req, res) => {
    const currentDate = new Date();

    const events = await Event.findAll({
        where: {
            event_date: {
                [Op.gt]: currentDate,
            },
        },
        order: [
            ['event_date', 'ASC'],
            [Sequelize.literal('LOWER(location)'), 'ASC'],
        ],
    });

    if (!events || events.length === 0) {
        throw new ApiError(404, 'No upcoming events found');
    }

    return res.status(200).json(
        new ApiResponse(200, events, 'Upcoming events retrieved successfully')
    );
});

// Controller to get event statistics
const eventStats = asyncHandler(async (req, res) => {
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

    // Count total registrations for event
    const totalRegistrations = await Registration.count({ where: { eventid: eventIdNum } });

    // Calculate remaining capacity and percentage used
    const remainingCapacity = Math.max(event.capacity - totalRegistrations, 0);
    const percentageUsed = event.capacity > 0 ? (totalRegistrations / event.capacity) * 100 : 0;

    const data = {
        eventid: event.eventid,
        title: event.title,
        capacity: event.capacity,
        totalRegistrations,
        remainingCapacity,
        percentageUsed: Number(percentageUsed.toFixed(2)), 
    };

    return res.status(200).json(
        new ApiResponse(200, data, 'Event statistics retrieved successfully')
    );
});

export {
    createEvent,
    getEventDetails,
    getUpcomingEvents,
    eventStats,
};
