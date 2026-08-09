import AWS from "aws-sdk";
import crypto from "crypto";
import config from "../config/config.js";
import { responseType } from "./constant.js";

const awsOptions = { region: config.AWS_REGION || "us-east-1", };

const awsAccessKeyId = config.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = config.AWS_SECRET_ACCESS_KEY;

if (awsAccessKeyId && awsSecretAccessKey) {
    awsOptions.accessKeyId = awsAccessKeyId;
    awsOptions.secretAccessKey = awsSecretAccessKey;
}

const SecretManager = new AWS.SecretsManager(awsOptions);
const KMS = new AWS.KMS(awsOptions);

const AWS_SM_SECRET_ID = config.AWS_SM_SECRET_ID;
const AWS_SM_PUBLIC_KEY = config.AWS_SM_PUBLIC_KEY;
const AWS_SM_PRIVATE_KEY = config.AWS_SM_PRIVATE_KEY;
const AWS_KMS_KEY_ID = config.AWS_KMS_KEY_ID;

const parseSecretData = (secretData) => {
    try {
        return JSON.parse(secretData);
    } catch {
        return secretData;
    }
};

const normalizeSecret = (secret) => {
    if (typeof secret === "string") {
        return { secretString: secret };
    }
    return secret;
};

const SendOutputFormat = (success = false, message = '', data = {}) => {
    return { type: success ? responseType['S'] : responseType['E'], success, message, data }
}

export const generateNewValue = (value) => {
    return Buffer.from(value).toString("base64")
}



// Get All Keys or Seprate
export const SM_Get_Pair = async (key = AWS_SM_PUBLIC_KEY) => {
    let errorMessage = '';
    try {
        const result = await SecretManager.getSecretValue({ SecretId: AWS_SM_SECRET_ID }).promise();
        const secretPairs = parseSecretData(result?.SecretString) || {};

        let outputPairs = {};
        if (key && key !== 'All') {
            outputPairs[key] = secretPairs[key];
        } else {
            outputPairs = secretPairs;
        }

        return SendOutputFormat(true, 'Secret Manager keys fetched & proccessed.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};



export const SM_Add_Or_Update_Key = async (key = null, value = null) => {
    let errorMessage = ''
    try {
        if (!key || !value) {
            errorMessage = "Key or Value is empty.";
            return SendOutputFormat(false, errorMessage);
        }

        const fetchedPairs = await SM_Get_Pair('All');

        if (!fetchedPairs?.success) {
            return fetchedPairs;
        }

        const updatedPairs = fetchedPairs?.data;

        updatedPairs[key] = typeof value === "string" ? value : JSON.stringify(value);

        const response = await SecretManager.updateSecret({
            SecretId: AWS_SM_SECRET_ID,
            SecretString: JSON.stringify(updatedPairs),
        }).promise();

        const outputPairs = {};
        outputPairs[key] = updatedPairs[key];

        return SendOutputFormat(true, 'Secret Manager key got added or updated.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
}



// Update Keys
export const SM_Generate_And_Add_Keys = async () => {
    let errorMessage = '';
    try {
        // Generate RSA key pair
        const { publicKey: PUBLIC_KEY, privateKey: PRIVATE_KEY } = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,

            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },

            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });

        if (!PUBLIC_KEY || !PRIVATE_KEY) {
            errorMessage = "Generated Public or Private key is empty.";
            return SendOutputFormat(false, errorMessage);
        }

        const fetchedPairs = await SM_Get_Pair('All');

        if (!fetchedPairs?.success) {
            return fetchedPairs;
        }

        const updatedPairs = fetchedPairs?.data;

        updatedPairs[AWS_SM_PUBLIC_KEY] = PUBLIC_KEY;
        updatedPairs[AWS_SM_PRIVATE_KEY] = PRIVATE_KEY;

        const response = await SecretManager.updateSecret({
            SecretId: AWS_SM_SECRET_ID,
            SecretString: JSON.stringify(updatedPairs),
        }).promise();

        const outputPairs = {}
        outputPairs[AWS_SM_PUBLIC_KEY] = updatedPairs[AWS_SM_PUBLIC_KEY]
        outputPairs[AWS_SM_PRIVATE_KEY] = updatedPairs[AWS_SM_PRIVATE_KEY]

        return SendOutputFormat(true, 'Secret Manager New Public & Private keys got generated.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};



// Encrypt Key
export const SM_Encrypt_Value = async (value = "") => {
    let errorMessage = '';
    try {
        if (!value) {
            errorMessage = "value to encrypt is empty.";
            return SendOutputFormat(false, errorMessage);
        }

        let fetchedPairs = await SM_Get_Pair();

        if (!fetchedPairs?.success) {
            return fetchedPairs;
        }

        fetchedPairs = fetchedPairs?.data;

        const encryptedValue = crypto.publicEncrypt(
            {
                key: fetchedPairs[AWS_SM_PUBLIC_KEY],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(value, "utf8")
        );

        const outputPairs = { encrypted_value: encryptedValue.toString("base64") };

        return SendOutputFormat(true, 'Secret Manager Public Key encrypted the value.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};



// Decrypt Key
export const SM_Decrypt_Value = async (encrypted_value = null) => {
    let errorMessage = '';
    try {
        if (!encrypted_value) {
            errorMessage = error.message;
            return SendOutputFormat(false, errorMessage);
            throw new Error("Failed to decrypt: encrypted value is empty.");
        }

        let fetchedPairs = await SM_Get_Pair(AWS_SM_PRIVATE_KEY);

        if (!fetchedPairs?.success) {
            return fetchedPairs;
        }

        fetchedPairs = fetchedPairs?.data;

        const decryptedValue = crypto.privateDecrypt(
            {
                key: fetchedPairs[AWS_SM_PRIVATE_KEY],
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(encrypted_value, "base64")
        );

        const outputPairs = { decrypted_value: decryptedValue.toString("utf8") };

        return SendOutputFormat(true, 'Secret Manager Privte Key decrypted the value.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};

export const SM_KMS_Get_Public_Key_New = async () => {
    let errorMessage = '';
    try {
        const publicKeyData = await KMS.getPublicKey({ KeyId: AWS_KMS_KEY_ID }).promise();
        const publicKeyPem = crypto.createPublicKey({
            key: publicKeyData.PublicKey,
            format: 'der',
            type: 'spki',
        }).export({ type: 'spki', format: 'pem' }).toString();

        const outputPairs = { kms_public_key: publicKeyPem, kms_key_id: AWS_KMS_KEY_ID };
        return SendOutputFormat(true, 'AWS KMS public key fetched successfully.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};

export const SM_KMS_Encrypt_Value_New = async (value = "") => {
    let errorMessage = '';
    try {
        if (!value) {
            errorMessage = "value to encrypt is empty.";
            return SendOutputFormat(false, errorMessage);
        }

        const publicKeyResponse = await KMS.getPublicKey({ KeyId: AWS_KMS_KEY_ID }).promise();
        const publicKeyPem = crypto.createPublicKey({
            key: publicKeyResponse.PublicKey,
            format: 'der',
            type: 'spki',
        }).export({ type: 'spki', format: 'pem' }).toString();

        const encryptedValue = crypto.publicEncrypt(
            {
                key: publicKeyPem,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            Buffer.from(value, "utf8")
        );

        const outputPairs = { encrypted_value: encryptedValue.toString("base64") };
        return SendOutputFormat(true, 'Value encrypted using AWS KMS public key.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};

export const SM_KMS_Decrypt_Value_New = async (encrypted_value = null) => {
    let errorMessage = '';
    try {
        if (!encrypted_value) {
            errorMessage = "Encrypted value is empty.";
            return SendOutputFormat(false, errorMessage);
        }

        const response = await KMS.decrypt({
            CiphertextBlob: Buffer.from(encrypted_value, "base64"),
            KeyId: AWS_KMS_KEY_ID,
            EncryptionAlgorithm: "RSAES_OAEP_SHA_256",
        }).promise();

        const decryptedValue = response?.Plaintext?.toString("utf8") ?? "";
        const outputPairs = { decrypted_value: decryptedValue };

        return SendOutputFormat(true, 'Value decrypted by AWS KMS.', outputPairs);
    } catch (error) {
        errorMessage = error.message;
        return SendOutputFormat(false, errorMessage);
    }
};

