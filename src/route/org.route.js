import { Router } from "express";
import * as orgController from "../controller/org.controller.js";
import { directHitApiProtect } from "../middleware/validation.middleware.js";
const orgRouter = Router();


/**
 * Create New Org
 */
orgRouter.post("/create-organizaton", orgController.createOrganizaton);

/**
 * Create New Org
 */
orgRouter.get("/all-organizatons", orgController.allOrganizatons);

/**
 * Add Org Member New Positions
 */
orgRouter.post("/add-position", directHitApiProtect, orgController.addPosition);


export default orgRouter;