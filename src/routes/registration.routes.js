import {  Router } from "express";
import {
    registerUserForEvent,
    cancelRegistration,
    getMyRegistrations
} from "../controllers/registration.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();    

// Protected routes (require authentication)
router.route("/my-registrations").get(authenticate, getMyRegistrations);
router.route("/registerUserForEvent/:eventid").post(authenticate, registerUserForEvent);
router.route("/cancelRegistration/:eventid").post(authenticate, cancelRegistration);

export default router;
