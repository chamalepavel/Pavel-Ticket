import express from "express"
import cors from "cors"

const app = express()

app.use(cors({origin: true, credentials: true}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// route import
import eventRouter from "./routes/event.routes.js";
import userRouter from "./routes/user.routes.js";

import { errorHandler } from "./utils/errorHandler.js";

// route declaration
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

export default app;