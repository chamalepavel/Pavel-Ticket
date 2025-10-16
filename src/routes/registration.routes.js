import {  Router } from "express";
import {
    registerUserForEvent,
    cancelRegistration,
} from "../controllers/registration.controller.js";

const router = Router();    

router.route("/registerUserForEvent/:eventid").post(registerUserForEvent);
router.route("/cancelRegistration/:eventid").post(cancelRegistration);

export default router;