import dotenv from "dotenv";

dotenv.config({ quiet: true });

const {
    APP_PORT, APP_URL, LOCAL_BASE_URL,
    AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
    AWS_SM_PUBLIC_KEY, AWS_SM_PRIVATE_KEY, AWS_SM_SECRET_ID, HARD_CODED_AWS_KMS_KEY_ID,
    MYSQL_DB_NAME, MYSQL_DB_HOST, MYSQL_DB_PORT, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_TABLE_VERSION_APPROVED_BY,
    JWT_SECRET_KEY, MONGO_URI,
} = process.env;

const config = {
    APP_PORT, APP_URL, LOCAL_BASE_URL,
    AWS_REGION: AWS_REGION || 'us-east-1', AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
    AWS_SM_PUBLIC_KEY, AWS_SM_PRIVATE_KEY, AWS_SM_SECRET_ID, HARD_CODED_AWS_KMS_KEY_ID,
    MYSQL_DB_NAME, MYSQL_DB_HOST, MYSQL_DB_PORT, MYSQL_DB_USER, MYSQL_DB_PASSWORD, MYSQL_TABLE_VERSION_APPROVED_BY,
    JWT_SECRET_KEY, MONGO_URI,
}

for (const [key, value] of Object.entries(config)) {
    if (!value) {
        throw new Error(`${key} key is not defined in environment variables`);
        break;
    }
}

export default config;