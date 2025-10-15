import {  Router } from "express";
import {
    createEvent,
    getEventDetails,
    registerUserForEvent,
} from "../controllers/event.controller.js";

const router = Router();    

router.route("/createEvent").post(createEvent);
router.route("/getEventDetails/:eventid").get(getEventDetails);
router.route("/registerUserForEvent/:eventid").post(registerUserForEvent);

export default router;