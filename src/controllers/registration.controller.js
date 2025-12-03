import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Event, User, Registration } from '../models/index.model.js';

// register user for event with quantity
const registerUserForEvent = asyncHandler(async (req, res) => {
    const userid = req.user.userid;
    const { eventid } = req.params;
    const { quantity } = req.body;

    const eventIdNum = Number(eventid);
    if (!Number.isInteger(eventIdNum) || eventIdNum < 1) {
        throw new ApiError(400, 'Invalid eventid parameter');
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
        throw new ApiError(400, 'Quantity must be at least 1');
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
        throw new ApiError(400, 'Event date has already passed');
    }

    const existingRegistration = await Registration.findOne({
        where: { userid, eventid: eventIdNum }
    });
    if (existingRegistration) {
        throw new ApiError(400, 'You are already registered for this event');
    }

    // check capacity with quantity
    const totalRegistered = await Registration.sum('quantity', { 
        where: { eventid: eventIdNum } 
    }) || 0;
    
    const availableSeats = event.capacity - totalRegistered;
    if (qty > availableSeats) {
        throw new ApiError(400, `Only ${availableSeats} seats available`);
    }

    const unitPrice = parseFloat(event.price);
    const totalPrice = unitPrice * qty;

    const registration = await Registration.create({
        userid,
        eventid: eventIdNum,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        final_price: totalPrice,
        payment_status: 'completed'
    });

    // update event tickets_sold
    await event.increment('tickets_sold', { by: qty });
    await event.increment('total_revenue', { by: totalPrice });

    return res.status(201).json(
        new ApiResponse(201, registration, 'Registration successful')
    );
});

// Controller to cancel a user's registration for an event
const cancelRegistration = asyncHandler(async (req, res) => {
    const userid = req.user.userid; // Get from authenticated user
    const { eventid } = req.params;

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

// Controller to get user's registrations
const getMyRegistrations = asyncHandler(async (req, res) => {
    const userid = req.user.userid;

    const registrations = await Registration.findAll({
        where: { userid },
        include: [{
            model: Event,
            as: 'event',
            attributes: ['eventid', 'title', 'description', 'event_date', 'location', 'price', 'image_url', 'is_active']
        }],
        order: [['registered_at', 'DESC']]
    });

    return res.status(200).json(
        new ApiResponse(200, registrations, 'User registrations retrieved successfully')
    );
});

export {
    registerUserForEvent,
    cancelRegistration,
    getMyRegistrations
}
