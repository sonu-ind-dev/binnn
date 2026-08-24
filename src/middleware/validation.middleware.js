import config from "../config/config.js";
import { catchErrorResponse } from "../util/common.js";

export const directHitApiProtect = (req, res, next) => {
    let errorMessage = '';
    try {
        const { API_HIT_ACCESS_CODE } = req.body;

        if (config.API_HIT_ACCESS_CODE !== API_HIT_ACCESS_CODE) {
            errorMessage = 'You do not have access to perform this api call';
            return res.status(400).json(catchErrorResponse(errorMessage));
        }

        next();
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};