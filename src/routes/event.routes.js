import {  Router } from "express";
import {
    createEvent,
    getEventDetails,
} from "../controllers/event.controller.js";

const router = Router();    

router.route("/createEvent").post(createEvent);
router.route("/getEventDetails/:eventid").get(getEventDetails);

export default router;