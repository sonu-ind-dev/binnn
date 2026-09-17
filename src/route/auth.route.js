import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import * as secretManagerController from "../controller/secret_manager.controller.js";

const authRouter = Router();


/**
 * POST - /api/auth/register
*/
authRouter.post("/register", authController.register);

/**
 * POST - /api/auth/verify-otp
 */
authRouter.post("/verify-otp", authController.verifyOtp);

/**
 * POST - /api/auth/login
 */
authRouter.post("/login", authController.login);

// & Get User Profile Info - For visitors
// & Block Any User



/**
 * GET - /api/auth/sm-generate-public-key
 */
authRouter.get("/sm-generate-public-key", secretManagerController.smGeneratePublicKey);

/**
 * GET - /api/auth/sm-public-key
 */
authRouter.get("/sm-public-key", secretManagerController.smPublicKey);

/**
 * GET - /api/auth/sm-get-value
 */
authRouter.get("/sm-get-value", secretManagerController.smGetValue);

/**
 * GET - /api/auth/sm-add-or-update-key
 */
authRouter.get("/sm-add-or-update-key", secretManagerController.smAddOrUpdateKey);

/**
 * GET - /api/auth/sm-encrypt-value
 */
authRouter.get("/sm-encrypt-value", secretManagerController.smEncryptValue);

/**
 * GET - /api/auth/sm-decrypt-value
 */
authRouter.get("/sm-decrypt-value", secretManagerController.smDecryptValue);

/**
 * GET - /api/auth/sm-kms-get-public-key-new
 */
authRouter.get("/sm-kms-get-public-key-new", secretManagerController.smKmsGetPublicKeyNew);

/**
 * GET - /api/auth/sm-kms-encrypt-value-new
 */
authRouter.get("/sm-kms-encrypt-value-new", secretManagerController.smKmsEncryptValueNew);

/**
 * GET - /api/auth/sm-kms-decrypt-value-new
 */
authRouter.get("/sm-kms-decrypt-value-new", secretManagerController.smKmsDecryptValueNew);

export default authRouter;
