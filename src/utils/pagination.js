/**
 * Calculate pagination metadata
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} totalItems - Total number of items
 * @returns {Object} Pagination metadata
 */
export const getPaginationMeta = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);

    return {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage > 1 ? currentPage - 1 : null
    };
};

/**
 * Get pagination parameters from request
 * @param {Object} query - Request query parameters
 * @returns {Object} Pagination parameters
 */
export const getPaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination params
    const validatedPage = page > 0 ? page : 1;
    const validatedLimit = limit > 0 && limit <= 100 ? limit : 10;
    const validatedOffset = (validatedPage - 1) * validatedLimit;

    return {
        page: validatedPage,
        limit: validatedLimit,
        offset: validatedOffset
    };
};
