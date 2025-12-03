import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"

const app = express()

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
}));

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Static files
app.use(express.static("public"));

// Route imports
import authRouter from "./routes/auth.routes.js";
import eventRouter from "./routes/event.routes.js";
import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import adminRouter from "./routes/admin.routes.js";
import registrationRouter from "./routes/registration.routes.js";
import ticketTypeRouter from "./routes/ticketType.routes.js";
import promoCodeRouter from "./routes/promoCode.routes.js";

import { errorHandler } from "./utils/errorHandler.js";

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Event Management API is running',
        timestamp: new Date().toISOString()
    });
});

// API route declarations
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/tickets", ticketRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/registrations", registrationRouter);
app.use("/api/v1/ticket-types", ticketTypeRouter);
app.use("/api/v1/promo-codes", promoCodeRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        statusCode: 404,
        success: false,
        message: 'Route not found'
    });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
