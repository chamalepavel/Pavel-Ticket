import {  Router } from "express";
import {
    createEvent,
    getEventDetails,
    getUpcomingEvents,
    eventStats,
} from "../controllers/event.controller.js";

const router = Router();    

router.route("/createEvent").post(createEvent);
router.route("/getEventDetails/:eventid").get(getEventDetails);
router.route("/getUpcomingEvents").get(getUpcomingEvents);
router.route("/eventStats/:eventid").get(eventStats);

export default router;