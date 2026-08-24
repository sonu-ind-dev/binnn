import { Router } from "express";
import * as postController from "../controller/post.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";
import { memberAccessCheck, org_tasks } from "../middleware/org_access.middleware.js";

const postRouter = Router();


/**
 * Create Post
 */
postRouter.post("/create-post", checkAuth, memberAccessCheck(org_tasks['create-post']), postController.createPost);

export default postRouter;