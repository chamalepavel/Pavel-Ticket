import { ApiError } from "../utils/ApiError.js";
const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            statusCode: err.statusCode, 
            message: err.message,
            path: req.originalUrl,
            data: err.data || null,
            error: err.error || [],
        });
    }

    res.status(500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
    });
};

export { errorHandler };