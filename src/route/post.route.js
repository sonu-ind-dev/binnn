import { Router } from "express";
import * as postController from "../controller/post.controller.js";
import { checkAuth } from "../middleware/auth.middleware.js";
import { memberAccessCheck } from "../middleware/org_access.middleware.js";

const postRouter = Router();


/**
 * Create Post
 */
postRouter.post("/create-post", checkAuth, memberAccessCheck('create-post'), postController.createPost);

/**
 * Fetch Area Level Recent Posts
 */
postRouter.get("/posts", checkAuth, postController.posts);

/**
 * Get Tagged User & Organization Details Of A Post
 */
postRouter.get("/post-tagged-info", checkAuth, postController.postTaggedInfo)

export default postRouter;