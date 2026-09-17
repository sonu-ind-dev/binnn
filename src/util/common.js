import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as argon2 from "argon2";
import config from "../config/config.js";
import { responseType } from "./constant.js";



// & Response Formats
export const responseInfo = ({ type, success, message, data = null }) => ({
    success,
    type,
    data,
    message,
});
export const catchSuccessResponse = (successMessage = '', data = null) => ({
    data,
    success: true,
    type: responseType['S'],
    message: successMessage || 'Successful',
});
export const catchErrorResponse = (errorMessage = '', data = null) => ({
    data,
    success: false,
    type: responseType['E'],
    message: errorMessage || 'Request faced internal server error',
});
export const catchWarningResponse = (warningMessage = '', data = null) => ({
    data,
    success: false,
    type: responseType['W'],
    message: warningMessage || 'Due to some warning issue this request failed.',
});



/**
// & Encryption, Hash, Comparision
// & | --------------------- | --------- | ----------- |
// & | Feature               | bcrypt    | Argon2id    |
// & | --------------------- | --------- | ----------- |
// ? | Security              | Very good | Excellent   |
// ? | Speed                 | Faster    | Slower      |
// ? | Memory usage          | Low       | High        |
// ? | GPU attack resistance | Good      | Better      |
// ? | Industry adoption     | Very high | Increasing  |
// ? | OWASP recommendation  | Good      | Preferred   |
// ?
// ? Argon2id → best choice if you can use it.
// ? bcrypt → completely acceptable if you want simplicity and compatibility.
*/

// ? argon2
// export const GenerateHashed = async (value) => await argon2.hash(value, { type: argon2.argon2id });
// export const VerifyWithHash = async (enteredValue, hashedValue) => await argon2.verify(hashedValue, enteredValue);

// ? bcrypt
// export const GenerateHashed = async (value) => await bcrypt.hash(value, 12);
// export const VerifyWithHash = async (enteredValue, hashedValue) => await bcrypt.compare(enteredValue, hashedValue);

// ? crypto
export const GenerateHashed = (value) => crypto.createHash("sha256").update(value).digest("hex");
export const VerifyWithHash = (enteredValue, hashedValue) => {
    let valueHash = crypto.createHash("sha256").update(enteredValue).digest("hex");
    return hashedValue === valueHash;
};



/**
 * 
 * @param {Object} Token_Info Object having user_id and refresh_token_hash details
 * @param {String} expiresIn Token expiry control
 */
export const Generate_JWT_Token = ({ user_id, refresh_token_hash }, expiresIn) => {
    const Token = jwt.sign({ user_id, refresh_token_hash: refresh_token_hash ?? null }, config.JWT_SECRET_KEY, { expiresIn: expiresIn });
    return Token;
}

/**
 * 
 * @param {String} token To fetch the token info
 * @returns 
 */
export const Decode_JWT_Token = (token) => {
    const decode = jwt.verify(token, config.JWT_SECRET_KEY);
    return decode;
}



// ? Generate Hash OTP
export const GenerateHashedOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = GenerateHashed(String(123123));

    return hashedOtp;
}