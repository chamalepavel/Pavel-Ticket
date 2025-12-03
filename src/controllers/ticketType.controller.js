import { TicketType, Event } from '../models/index.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Crear tipo de ticket para un evento
export const createTicketType = asyncHandler(async (req, res) => {
    const { eventid } = req.params;
    const {
        name,
        description,
        price,
        quantity_available,
        sale_start_date,
        sale_end_date,
        benefits,
        sort_order
    } = req.body;

    // Verificar que el evento existe
    const event = await Event.findByPk(eventid);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    const ticketType = await TicketType.create({
        eventid,
        name,
        description,
        price,
        quantity_available,
        quantity_sold: 0,
        sale_start_date,
        sale_end_date,
        benefits: benefits ? JSON.stringify(benefits) : null,
        sort_order: sort_order || 0,
        is_active: true
    });

    res.status(201).json(
        new ApiResponse(201, ticketType, 'Ticket type created successfully')
    );
});

// Obtener todos los tipos de tickets de un evento
export const getEventTicketTypes = asyncHandler(async (req, res) => {
    const { eventid } = req.params;

    const ticketTypes = await TicketType.findAll({
        where: { eventid },
        order: [['sort_order', 'ASC'], ['ticket_type_id', 'ASC']]
    });

    // Parsear benefits JSON
    const ticketTypesWithBenefits = ticketTypes.map(tt => {
        const data = tt.toJSON();
        if (data.benefits) {
            try {
                data.benefits = JSON.parse(data.benefits);
            } catch (e) {
                data.benefits = null;
            }
        }
        return data;
    });

    res.status(200).json(
        new ApiResponse(200, ticketTypesWithBenefits, 'Ticket types retrieved successfully')
    );
});

// Obtener un tipo de ticket específico
export const getTicketType = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ticketType = await TicketType.findByPk(id, {
        include: [{
            model: Event,
            as: 'event',
            attributes: ['eventid', 'title', 'event_date']
        }]
    });

    if (!ticketType) {
        throw new ApiError(404, 'Ticket type not found');
    }

    const data = ticketType.toJSON();
    if (data.benefits) {
        try {
            data.benefits = JSON.parse(data.benefits);
        } catch (e) {
            data.benefits = null;
        }
    }

    res.status(200).json(
        new ApiResponse(200, data, 'Ticket type retrieved successfully')
    );
});

// Actualizar tipo de ticket
export const updateTicketType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
        throw new ApiError(404, 'Ticket type not found');
    }

    // Si se actualiza benefits, convertir a JSON
    if (updateData.benefits && typeof updateData.benefits === 'object') {
        updateData.benefits = JSON.stringify(updateData.benefits);
    }

    await ticketType.update(updateData);

    res.status(200).json(
        new ApiResponse(200, ticketType, 'Ticket type updated successfully')
    );
});

// Eliminar tipo de ticket
export const deleteTicketType = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
        throw new ApiError(404, 'Ticket type not found');
    }

    await ticketType.destroy();

    res.status(200).json(
        new ApiResponse(200, null, 'Ticket type deleted successfully')
    );
});

// Verificar disponibilidad de un tipo de ticket
export const checkAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.query;

    const ticketType = await TicketType.findByPk(id);
    if (!ticketType) {
        throw new ApiError(404, 'Ticket type not found');
    }

    const available = ticketType.quantity_available - ticketType.quantity_sold;
    const requestedQuantity = parseInt(quantity) || 1;
    
    const isAvailable = ticketType.is_active && available >= requestedQuantity;

    res.status(200).json(
        new ApiResponse(200, {
            ticket_type_id: ticketType.ticket_type_id,
            name: ticketType.name,
            available_quantity: available,
            requested_quantity: requestedQuantity,
            is_available: isAvailable,
            price: ticketType.price
        }, 'Availability checked successfully')
    );
});
