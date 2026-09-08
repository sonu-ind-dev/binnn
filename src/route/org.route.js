import { Router } from "express";
import * as orgController from "../controller/org.controller.js";
import { directHitApiProtect } from "../middleware/validation.middleware.js";
import { memberAccessCheck } from "../middleware/org_access.middleware.js";
const orgRouter = Router();


/**
 * Create New Org
 */
orgRouter.post("/create-organization", orgController.createOrganization);

/**
 * Fetch All Organizations Who's Member User Is
 */
orgRouter.get("/all-organization", orgController.allOrganization);

/**
 * Fetch Organizations Details
 */
orgRouter.get("/organization/:org_id", orgController.organization);

/**
 * Edit Organization Name
 */
orgRouter.post("/rename-organization", memberAccessCheck('rename-organization'), orgController.renameOrganization);

/**
 * Edit Organization Code
*/
orgRouter.post("/update-org-code", memberAccessCheck('update-org-code'), orgController.updateOrgCode);

/**
 * Edit Organization Location
*/
orgRouter.post("/update-org-location", memberAccessCheck('update-org-location'), orgController.updateOrgLocation);

/**
 * Fetch Details Of Org Members With Their Basic Info
*/
orgRouter.get("/org-members", memberAccessCheck('org-members'), orgController.orgMembers);

/**
 * 
 */









/**
 * Add Org Member New Positions
 */
orgRouter.post("/add-position", directHitApiProtect, orgController.addPosition);


export default orgRouter;