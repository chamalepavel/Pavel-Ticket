import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Ticket, Event, User, Category } from '../models/index.model.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';

/**
 * Purchase/Create a ticket for an event
 */
export const purchaseTicket = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const userid = req.user.userid;

    // Validate event exists and is active
    const event = await Event.findByPk(eventid);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    if (!event.is_active) {
        throw new ApiError(400, 'Event is not active');
    }

    // Check if event is in the future
    if (new Date(event.event_date) <= new Date()) {
        throw new ApiError(400, 'Cannot purchase tickets for past events');
    }

    // Check if user already has a ticket for this event
    const existingTicket = await Ticket.findOne({
        where: { userid, eventid, status: 'active' }
    });

    if (existingTicket) {
        throw new ApiError(400, 'You already have an active ticket for this event');
    }

    // Check event capacity
    const soldTickets = await Ticket.count({
        where: { eventid, status: 'active' }
    });

    if (soldTickets >= event.capacity) {
        throw new ApiError(400, 'Event is sold out');
    }

    // Create ticket
    const newTicket = await Ticket.create({
        userid,
        eventid,
        price: event.price
    });

    // Fetch complete ticket data
    const ticketData = await Ticket.findByPk(newTicket.ticket_id, {
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title', 'event_date', 'location', 'price']
            }
        ]
    });

    return res.status(201).json(
        new ApiResponse(201, ticketData, 'Ticket purchased successfully')
    );
});

/**
 * Get user's tickets
 */
export const getUserTickets = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const userid = req.user.userid;
    const { status } = req.query;

    const whereClause = { userid };
    if (status) {
        whereClause.status = status;
    }

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
        new ApiResponse(200, { tickets, pagination }, 'User tickets retrieved successfully')
    );
});

/**
 * Get ticket by ID (user must own the ticket)
 */
export const getTicketById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.userid;
    const userRole = req.user.role?.name;

    const ticket = await Ticket.findByPk(id, {
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
            },
            {
                model: User,
                as: 'user',
                attributes: ['userid', 'name', 'email']
            }
        ]
    });

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // Only owner or admin can view ticket
    if (ticket.userid !== userid && userRole !== 'admin') {
        throw new ApiError(403, 'Access denied');
    }

    return res.status(200).json(
        new ApiResponse(200, ticket, 'Ticket retrieved successfully')
    );
});

/**
 * Cancel ticket (change status to cancelled)
 */
export const cancelTicket = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userid = req.user.userid;

    const ticket = await Ticket.findByPk(id, {
        include: [{
            model: Event,
            as: 'event'
        }]
    });

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    // Only owner can cancel their ticket
    if (ticket.userid !== userid) {
        throw new ApiError(403, 'Access denied');
    }

    if (ticket.status === 'cancelled') {
        throw new ApiError(400, 'Ticket is already cancelled');
    }

    if (ticket.status === 'used') {
        throw new ApiError(400, 'Cannot cancel a used ticket');
    }

    // Check if event is in the past
    if (new Date(ticket.event.event_date) <= new Date()) {
        throw new ApiError(400, 'Cannot cancel ticket for past events');
    }

    ticket.status = 'cancelled';
    await ticket.save();

    return res.status(200).json(
        new ApiResponse(200, ticket, 'Ticket cancelled successfully')
    );
});

/**
 * Get all tickets (Admin only)
 */
export const getAllTickets = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { status, eventid } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (eventid) whereClause.eventid = eventid;

    const { count, rows: tickets } = await Ticket.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['purchase_date', 'DESC']],
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title', 'event_date', 'location']
            },
            {
                model: User,
                as: 'user',
                attributes: ['userid', 'name', 'email']
            }
        ]
    });

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { tickets, pagination }, 'All tickets retrieved successfully')
    );
});

/**
 * Mark ticket as used (Admin/Organizer only)
 */
export const markTicketAsUsed = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    if (ticket.status === 'used') {
        throw new ApiError(400, 'Ticket is already marked as used');
    }

    if (ticket.status === 'cancelled') {
        throw new ApiError(400, 'Cannot use a cancelled ticket');
    }

    ticket.status = 'used';
    await ticket.save();

    return res.status(200).json(
        new ApiResponse(200, ticket, 'Ticket marked as used successfully')
    );
});

/**
 * Verify ticket by unique code
 */
export const verifyTicket = asyncHandler(async (req, res) => {
    const { unique_code } = req.params;

    const ticket = await Ticket.findOne({
        where: { unique_code },
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title', 'event_date', 'location']
            },
            {
                model: User,
                as: 'user',
                attributes: ['userid', 'name', 'email']
            }
        ]
    });

    if (!ticket) {
        throw new ApiError(404, 'Ticket not found');
    }

    const isValid = ticket.status === 'active' && new Date(ticket.event.event_date) >= new Date();

    return res.status(200).json(
        new ApiResponse(200, { ticket, isValid }, 'Ticket verification completed')
    );
});
