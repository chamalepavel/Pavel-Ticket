import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Category, Event } from '../models/index.model.js';
import { getPaginationParams, getPaginationMeta } from '../utils/pagination.js';

/**
 * Create a new category (Admin only)
 */
export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, 'Category name is required');
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
        throw new ApiError(409, 'Category with this name already exists');
    }

    const newCategory = await Category.create({
        name,
        description
    });

    return res.status(201).json(
        new ApiResponse(201, newCategory, 'Category created successfully')
    );
});

/**
 * Get all categories with pagination
 */
export const getAllCategories = asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { is_active } = req.query;

    const whereClause = {};
    if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
    }

    const { count, rows: categories } = await Category.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['name', 'ASC']],
        include: [{
            model: Event,
            as: 'events',
            attributes: ['eventid', 'title'],
            required: false
        }]
    });

    const pagination = getPaginationMeta(page, limit, count);

    return res.status(200).json(
        new ApiResponse(200, { categories, pagination }, 'Categories retrieved successfully')
    );
});

/**
 * Get active categories (no pagination, for dropdown/select)
 */
export const getActiveCategories = asyncHandler(async (req, res) => {
    const categories = await Category.findAll({
        where: { is_active: true },
        attributes: ['category_id', 'name', 'description'],
        order: [['name', 'ASC']]
    });

    return res.status(200).json(
        new ApiResponse(200, categories, 'Active categories retrieved successfully')
    );
});

/**
 * Get category by ID
 */
export const getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
        include: [{
            model: Event,
            as: 'events',
            attributes: ['eventid', 'title', 'event_date', 'location']
        }]
    });

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    return res.status(200).json(
        new ApiResponse(200, category, 'Category retrieved successfully')
    );
});

/**
 * Update category (Admin only)
 */
export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    // Check if new name already exists (excluding current category)
    if (name && name !== category.name) {
        const existingCategory = await Category.findOne({
            where: { name }
        });
        if (existingCategory) {
            throw new ApiError(409, 'Category with this name already exists');
        }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, 'Category updated successfully')
    );
});

/**
 * Delete category (Admin only)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    // Check if category has associated events
    const eventCount = await Event.count({ where: { category_id: id } });
    if (eventCount > 0) {
        throw new ApiError(400, `Cannot delete category. It has ${eventCount} associated events. Consider deactivating instead.`);
    }

    await category.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, 'Category deleted successfully')
    );
});

/**
 * Toggle category active status (Admin only)
 */
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
        throw new ApiError(404, 'Category not found');
    }

    category.is_active = !category.is_active;
    await category.save();

    return res.status(200).json(
        new ApiResponse(200, category, `Category ${category.is_active ? 'activated' : 'deactivated'} successfully`)
    );
});
