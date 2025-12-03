import { PromoCode, Event, User } from '../models/index.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Op } from 'sequelize';

// Crear código promocional
export const createPromoCode = asyncHandler(async (req, res) => {
    const {
        code,
        description,
        discount_type,
        discount_value,
        eventid,
        max_uses,
        valid_from,
        valid_until
    } = req.body;

    // Verificar que el código no exista
    const existingCode = await PromoCode.findOne({ where: { code: code.toUpperCase() } });
    if (existingCode) {
        throw new ApiError(400, 'Promo code already exists');
    }

    // Si es para un evento específico, verificar que existe
    if (eventid) {
        const event = await Event.findByPk(eventid);
        if (!event) {
            throw new ApiError(404, 'Event not found');
        }
    }

    const promoCode = await PromoCode.create({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        eventid: eventid || null,
        max_uses: max_uses || null,
        times_used: 0,
        valid_from,
        valid_until,
        is_active: true,
        created_by: req.user.userid
    });

    res.status(201).json(
        new ApiResponse(201, promoCode, 'Promo code created successfully')
    );
});

// Obtener todos los códigos promocionales
export const getAllPromoCodes = asyncHandler(async (req, res) => {
    const { eventid, is_active } = req.query;

    const where = {};
    if (eventid) where.eventid = eventid;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const promoCodes = await PromoCode.findAll({
        where,
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title']
            },
            {
                model: User,
                as: 'creator',
                attributes: ['userid', 'username', 'email']
            }
        ],
        order: [['created_at', 'DESC']]
    });

    res.status(200).json(
        new ApiResponse(200, promoCodes, 'Promo codes retrieved successfully')
    );
});

// Obtener un código promocional específico
export const getPromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const promoCode = await PromoCode.findByPk(id, {
        include: [
            {
                model: Event,
                as: 'event',
                attributes: ['eventid', 'title', 'event_date']
            },
            {
                model: User,
                as: 'creator',
                attributes: ['userid', 'username', 'email']
            }
        ]
    });

    if (!promoCode) {
        throw new ApiError(404, 'Promo code not found');
    }

    res.status(200).json(
        new ApiResponse(200, promoCode, 'Promo code retrieved successfully')
    );
});

// Validar código promocional
export const validatePromoCode = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const { eventid } = req.query;

    const promoCode = await PromoCode.findOne({
        where: { code: code.toUpperCase() }
    });

    if (!promoCode) {
        throw new ApiError(404, 'Promo code not found');
    }

    const now = new Date();
    const errors = [];

    // Validaciones
    if (!promoCode.is_active) {
        errors.push('Promo code is inactive');
    }

    if (now < new Date(promoCode.valid_from)) {
        errors.push('Promo code is not yet valid');
    }

    if (now > new Date(promoCode.valid_until)) {
        errors.push('Promo code has expired');
    }

    if (promoCode.max_uses && promoCode.times_used >= promoCode.max_uses) {
        errors.push('Promo code has reached maximum uses');
    }

    if (promoCode.eventid && eventid && promoCode.eventid !== parseInt(eventid)) {
        errors.push('Promo code is not valid for this event');
    }

    const isValid = errors.length === 0;

    res.status(200).json(
        new ApiResponse(200, {
            code: promoCode.code,
            is_valid: isValid,
            discount_type: promoCode.discount_type,
            discount_value: promoCode.discount_value,
            errors: errors,
            remaining_uses: promoCode.max_uses ? promoCode.max_uses - promoCode.times_used : null
        }, isValid ? 'Promo code is valid' : 'Promo code validation failed')
    );
});

// Actualizar código promocional
export const updatePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const promoCode = await PromoCode.findByPk(id);
    if (!promoCode) {
        throw new ApiError(404, 'Promo code not found');
    }

    // Si se actualiza el código, verificar que no exista
    if (updateData.code && updateData.code.toUpperCase() !== promoCode.code) {
        const existingCode = await PromoCode.findOne({ 
            where: { 
                code: updateData.code.toUpperCase(),
                promo_code_id: { [Op.ne]: id }
            } 
        });
        if (existingCode) {
            throw new ApiError(400, 'Promo code already exists');
        }
        updateData.code = updateData.code.toUpperCase();
    }

    await promoCode.update(updateData);

    res.status(200).json(
        new ApiResponse(200, promoCode, 'Promo code updated successfully')
    );
});

// Eliminar código promocional
export const deletePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const promoCode = await PromoCode.findByPk(id);
    if (!promoCode) {
        throw new ApiError(404, 'Promo code not found');
    }

    await promoCode.destroy();

    res.status(200).json(
        new ApiResponse(200, null, 'Promo code deleted successfully')
    );
});

// Desactivar código promocional
export const deactivatePromoCode = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const promoCode = await PromoCode.findByPk(id);
    if (!promoCode) {
        throw new ApiError(404, 'Promo code not found');
    }

    await promoCode.update({ is_active: false });

    res.status(200).json(
        new ApiResponse(200, promoCode, 'Promo code deactivated successfully')
    );
});

// Incrementar uso del código
export const incrementPromoCodeUsage = async (promoCodeId) => {
    const promoCode = await PromoCode.findByPk(promoCodeId);
    if (promoCode) {
        await promoCode.increment('times_used');
    }
};
