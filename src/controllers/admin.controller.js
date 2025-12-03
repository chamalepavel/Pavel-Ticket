import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User, Event, Ticket, Category, Role, Registration } from '../models/index.model.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';
import bcrypt from 'bcryptjs';
import { sequelize } from '../models/index.model.js';

// dashboard stats
export const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.count();
    const totalEvents = await Event.count();
    const totalTickets = await Ticket.count();
    const activeTickets = await Ticket.count({ where: { status: 'active' } });

    const tickets = await Ticket.findAll({
        where: { status: 'active' },
        attributes: ['price']
    });
    const totalRevenue = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price || 0), 0);

    // Recent events
    const recentEvents = await Event.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['category_id', 'name']
            }
        ]
    });

    // Events by category
    const eventsByCategory = await Category.findAll({
        attributes: [
            'category_id',
            'name',
            [sequelize.fn('COUNT', sequelize.col('events.eventid')), 'event_count']
        ],
        include: [{
            model: Event,
            as: 'events',
            attributes: []
        }],
        group: ['Category.category_id', 'Category.name'],
        raw: true
    });

    // Upcoming events count
    const upcomingEvents = await Event.count({
        where: {
            event_date: { [sequelize.Sequelize.Op.gt]: new Date() },
            is_active: true
        }
    });

    const stats = {
        totalUsers,
        totalEvents,
        totalTickets,
        activeTickets,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        upcomingEvents,
        recentEvents,
        eventsByCategory
    };

    return res.status(200).json(
        new ApiResponse(200, stats, 'Dashboard statistics retrieved successfully')
    );
});

// get users list
export const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { role_id, is_active, search } = req.query;

    const where = {};
    if (role_id) where.role_id = role_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (search) {
        where[sequelize.Sequelize.Op.or] = [
            { name: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
            { email: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } }
        ];
    }

    const { count, rows: users } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }],
        attributes: { exclude: ['password'] }
    });

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { users, pagination }, 'Users retrieved successfully')
    );
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userid } = req.params;
    const { role_id } = req.body;

    if (!role_id) {
        throw new ApiError(400, 'Role ID is required');
    }

    // Verify role exists
    const role = await Role.findByPk(role_id);
    if (!role) {
        throw new ApiError(404, 'Role not found');
    }

    const user = await User.findByPk(userid);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent changing own role
    if (user.userid === req.user.userid) {
        throw new ApiError(400, 'You cannot change your own role');
    }

    user.role_id = role_id;
    await user.save();

    const updatedUser = await User.findByPk(userid, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }],
        attributes: { exclude: ['password'] }
    });

    return res.status(200).json(
        new ApiResponse(200, updatedUser, 'User role updated successfully')
    );
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
    const { userid } = req.params;

    const user = await User.findByPk(userid);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent deactivating own account
    if (user.userid === req.user.userid) {
        throw new ApiError(400, 'You cannot deactivate your own account');
    }

    user.is_active = !user.is_active;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, { userid: user.userid, is_active: user.is_active }, `User ${user.is_active ? 'activated' : 'deactivated'} successfully`)
    );
});

export const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role_id } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, 'Name, email and password are required');
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, 'User with this email already exists');
    }

    // Verify role exists
    let userRoleId = role_id;
    if (role_id) {
        const role = await Role.findByPk(role_id);
        if (!role) {
            throw new ApiError(404, 'Role not found');
        }
    } else {
        const defaultRole = await Role.findOne({ where: { name: 'user' } });
        userRoleId = defaultRole.role_id;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role_id: userRoleId
    });

    const userData = await User.findByPk(newUser.userid, {
        include: [{
            model: Role,
            as: 'role',
            attributes: ['role_id', 'name']
        }],
        attributes: { exclude: ['password'] }
    });

    return res.status(201).json(
        new ApiResponse(201, userData, 'User created successfully')
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userid } = req.params;

    const user = await User.findByPk(userid);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Prevent deleting own account
    if (user.userid === req.user.userid) {
        throw new ApiError(400, 'You cannot delete your own account');
    }

    // Check if user has tickets
    const ticketCount = await Ticket.count({ where: { userid } });
    if (ticketCount > 0) {
        throw new ApiError(400, `Cannot delete user. They have ${ticketCount} tickets. Consider deactivating instead.`);
    }

    // Check if user is organizer of events
    const eventCount = await Event.count({ where: { organizer_id: userid } });
    if (eventCount > 0) {
        throw new ApiError(400, `Cannot delete user. They are the organizer of ${eventCount} events.`);
    }

    await user.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, 'User deleted successfully')
    );
});

// sales report
export const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    let where = {};
    if (startDate || endDate) {
        where.event_date = {};
        if (startDate) {
            where.event_date[sequelize.Sequelize.Op.gte] = new Date(startDate);
        }
        if (endDate) {
            where.event_date[sequelize.Sequelize.Op.lte] = new Date(endDate);
        }
    }

    const events = await Event.findAll({
        where,
        include: [
            {
                model: Category,
                as: 'category',
                attributes: ['name']
            }
        ],
        attributes: [
            'eventid',
            'title',
            'event_date',
            'location',
            'price',
            'capacity',
            'is_active',
            'tickets_sold',
            'total_revenue'
        ],
        order: [['event_date', 'DESC']]
    });

    // Format event reports
    const eventReports = events.map(event => {
        const eventData = event.toJSON();
        return {
            eventid: eventData.eventid,
            title: eventData.title,
            event_date: eventData.event_date,
            location: eventData.location,
            price: parseFloat(eventData.price),
            capacity: eventData.capacity,
            is_active: eventData.is_active,
            category_name: eventData.category?.name || 'N/A',
            tickets_sold: eventData.tickets_sold || 0,
            total_revenue: parseFloat(eventData.total_revenue || 0).toFixed(2),
            occupancy_percentage: eventData.capacity > 0 
                ? ((eventData.tickets_sold || 0) / eventData.capacity * 100).toFixed(1)
                : '0.0'
        };
    });

    // Calculate summary
    const summary = {
        totalRevenue: eventReports.reduce((sum, event) => sum + parseFloat(event.total_revenue), 0).toFixed(2),
        totalTicketsSold: eventReports.reduce((sum, event) => sum + event.tickets_sold, 0),
        activeEvents: eventReports.filter(e => e.is_active).length,
        totalEvents: eventReports.length
    };

    return res.status(200).json(
        new ApiResponse(200, { eventReports, summary }, 'Sales report retrieved successfully')
    );
});

// update event sales manually
export const updateEventSales = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const { tickets_sold, total_revenue } = req.body;

    const event = await Event.findByPk(eventid);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Validate tickets_sold
    if (tickets_sold !== undefined) {
        if (tickets_sold < 0) {
            throw new ApiError(400, 'Tickets sold cannot be negative');
        }
        if (tickets_sold > event.capacity) {
            throw new ApiError(400, `Tickets sold (${tickets_sold}) cannot exceed capacity (${event.capacity})`);
        }
        event.tickets_sold = tickets_sold;
    }

    // Update or calculate total_revenue
    if (total_revenue !== undefined) {
        if (total_revenue < 0) {
            throw new ApiError(400, 'Total revenue cannot be negative');
        }
        event.total_revenue = total_revenue;
    } else if (tickets_sold !== undefined) {
        // Auto-calculate revenue based on tickets sold and price
        event.total_revenue = parseFloat(event.price) * tickets_sold;
    }

    await event.save();

    const updatedEvent = await Event.findByPk(eventid, {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['category_id', 'name']
        }]
    });

    return res.status(200).json(
        new ApiResponse(200, updatedEvent, 'Event sales updated successfully')
    );
});

export const getAttendeesReport = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    const event = await Event.findByPk(eventid);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Get all registrations for the event
    const registrations = await Registration.findAll({
        where: { eventid },
        include: [{
            model: User,
            as: 'user',
            attributes: ['userid', 'name', 'email', 'phone']
        }],
        order: [['created_at', 'ASC']]
    });

    const report = {
        event: {
            eventid: event.eventid,
            title: event.title,
            event_date: event.event_date,
            location: event.location,
            capacity: event.capacity,
            price: event.price
        },
        statistics: {
            total_registrations: registrations.length,
            revenue: Number((registrations.length * parseFloat(event.price)).toFixed(2)),
            occupancy: event.capacity > 0 ? ((registrations.length / event.capacity) * 100).toFixed(1) : 0
        },
        attendees: registrations
    };

    return res.status(200).json(
        new ApiResponse(200, report, 'Attendees report retrieved successfully')
    );
});

// reset event sales
export const resetEventSales = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    const event = await Event.findByPk(eventid);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    // Reset sales to zero
    event.tickets_sold = 0;
    event.total_revenue = 0;

    await event.save();

    const updatedEvent = await Event.findByPk(eventid, {
        include: [{
            model: Category,
            as: 'category',
            attributes: ['category_id', 'name']
        }]
    });

    return res.status(200).json(
        new ApiResponse(200, updatedEvent, 'Event sales reset successfully')
    );
});
