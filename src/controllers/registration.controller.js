import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Event, User, Registration } from '../models/index.model.js';

// Controller to register a user for an event
const registerUserForEvent = asyncHandler(async (req, res) => {
    const { userid } = req.body;
    const { eventid } = req.params;

    if (!userid) {
        throw new ApiError(400, 'Missing userid in request body');
    }

    if (!Number.isInteger(userid) || userid < 1) {
        throw new ApiError(400, 'Invalid userid');
    }

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const user = await User.findByPk(userid);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Upcoming event are exist or not
    const event = await Event.findByPk(eventIdNum);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    if (new Date(event.event_date) <= new Date()) {
        throw new ApiError(400, 'Event date has already passed');
    }

    // User already registered or not
    const existingRegistration = await Registration.findOne({
        where: { userid, eventid: eventIdNum }
    });
    if (existingRegistration) {
        throw new ApiError(400, 'User already registered for this event');
    }

    // Check capacity
    const registrationCount = await Registration.count({ where: { eventid: eventIdNum } });
    if (registrationCount >= event.capacity) {
        throw new ApiError(400, 'Event capacity is full');
    }

    const registration = await Registration.create({
        userid,
        eventid: eventIdNum,
    });

    return res.status(201).json(
        new ApiResponse(201, registration, 'User registered for event successfully')
    );
});

const cancelRegistration = asyncHandler(async (req, res) => {
    const { userid } = req.body;
    const { eventid } = req.params;

    if (!userid) {
        throw new ApiError(400, 'Missing userid in request body');
    }

    if (!Number.isInteger(userid) || userid < 1) {
        throw new ApiError(400, 'Invalid userid');
    }

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const user = await User.findByPk(userid);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const event = await Event.findByPk(eventIdNum);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    if (new Date(event.event_date) <= new Date()) {
        throw new ApiError(400, 'Event has already occurred, cannot cancel registration');
    }

    const existingRegistration = await Registration.findOne({
        where: { userid, eventid: eventIdNum },
    });

    if (!existingRegistration) {
        throw new ApiError(400, 'User is not registered for this event');
    }

    await existingRegistration.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, 'User registration successfully cancelled')
    );
});

export {
    registerUserForEvent,
    cancelRegistration
}