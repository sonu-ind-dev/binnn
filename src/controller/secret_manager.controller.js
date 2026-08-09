import config from "../config/config.js";
import { generateNewValue } from "../util/secretManager.js";
import { SM_Generate_And_Add_Keys, SM_Get_Pair, SM_Add_Or_Update_Key, SM_Encrypt_Value, SM_Decrypt_Value } from "../util/secretManager.js";
import { catchSuccessResponse, catchWarningResponse, catchErrorResponse, GenerateHashed, VerifyWithHash, GenerateHashedOtp, Generate_JWT_Token } from "../util/common.js";





export const smGetValue = async (req, res) => {
    let errorMessage = '';
    try {
        const sm_key = req.body.sm_key;
        const fetchedPairs = await SM_Get_Pair(sm_key);
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

export const smGeneratePublicKey = async (req, res) => {
    let errorMessage = '';
    try {
        const fetchedPairs = await SM_Generate_And_Add_Keys();
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

export const smPublicKey = async (req, res) => {
    let errorMessage = '';
    try {
        const fetchedPairs = await SM_Get_Pair();
        fetchedPairs.data[config.AWS_SM_PUBLIC_KEY] = generateNewValue(fetchedPairs.data[config.AWS_SM_PUBLIC_KEY]);
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

export const smAddOrUpdateKey = async (req, res) => {
    let errorMessage = '';
    try {
        const { key, value } = req.body;
        const fetchedPairs = await SM_Add_Or_Update_Key(key, value);
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

export const smEncryptValue = async (req, res) => {
    let errorMessage = '';
    try {
        const value = String(req.body.value);
        const fetchedPairs = await SM_Encrypt_Value(value);
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

export const smDecryptValue = async (req, res) => {
    let errorMessage = '';
    try {
        const encrypted_value = String(req.body.encrypted_value);
        const fetchedPairs = await SM_Decrypt_Value(encrypted_value);
        const statusCode = fetchedPairs?.success ? 200 : 400;

        return res.status(statusCode).json(fetchedPairs);
    } catch (error) {
        errorMessage = error.message;
        console.log(`ERROR: ${req.method} ${req.baseUrl}${req.path} - Error: ${error}`);
        return res.status(500).json(catchErrorResponse(errorMessage));
    }
};

