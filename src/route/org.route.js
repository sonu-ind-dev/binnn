import { Router } from "express";
import * as orgController from "../controller/org.controller.js";
import { directHitApiProtect } from "../middleware/validation.middleware.js";
const orgRouter = Router();



/**
 * Add Org Member New Positions
 */
orgRouter.post("/add-position", directHitApiProtect, orgController.addPosition);


export default orgRouter;