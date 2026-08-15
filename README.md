# bin

## Overview

This repository contains an Express-based authentication server with OTP registration, login, and AWS Secrets Manager-based asymmetric encryption support.

## Base URL

All APIs are mounted under:

`/api/auth`

For example: `http://localhost:4000/api/auth/register`

---

## Authentication APIs

### 1. Register User

- Method: `POST`
- Path: `/api/auth/register`
- Description: Register a user by phone number and password. This endpoint stores a hashed password and an OTP request record. The user must verify the OTP before becoming a full user.

#### Request Body

```json
{
  "phone_number": "1234567890",
  "password": "YourPassword123"
}
```

#### Validations

- `phone_number` must be provided and string.
- `password` must be provided and non-empty.
- If a user already exists in the main user table, registration is rejected.
- The same phone number can retry registration up to 5 times before a temporary block is applied.

#### Response

- `200` on success with OTP expiry details.
- `400` if input validation fails.
- `409` if the user already exists.
- `429` if registration is temporarily blocked.

#### Example Response

```json
{
  "success": true,
  "type": "success",
  "data": {
    "phone_number": "1234567890",
    "otp_expires_at": 1660000000000
  },
  "message": "User registered successfully."
}
```

---

### 2. Verify OTP

- Method: `POST`
- Path: `/api/auth/verify-otp`
- Description: Verify the OTP that was generated during registration. On successful verification, the pending registration is converted into a real user record.

#### Request Body

```json
{
  "phone_number": "1234567890",
  "otp": "123456"
}
```

#### Validations

- `phone_number` and `otp` must be provided.
- Checks for an existing pending registration record.
- Rejects if the OTP has expired.
- Rejects if verification is temporarily blocked due to too many failed attempts.
- If OTP verification fails, the request increments a retry counter.
- After 5 failed OTP attempts, verification is blocked for 1 minute and a new OTP is generated.

#### Response

- `201` on success with created user details.
- `400` for missing input, expired OTP, or wrong OTP with remaining attempts.
- `404` if no registration record exists.
- `409` if the phone number is already verified as a user.
- `429` if verification is blocked or too many wrong attempts occur.

---

### 3. Login

- Method: `POST`
- Path: `/api/auth/login`
- Description: Authenticate a verified user with phone number and password. Generates access and refresh tokens for the session.

#### Request Body

```json
{
  "phone_number": "1234567890",
  "password": "YourPassword123"
}
```

#### Validations

- `phone_number` and `password` must be provided.
- Verifies the stored password hash.
- If login succeeds, a refresh token is stored and a JWT access token is returned.

#### Response

- `200` on success with user profile and access token.
- `401` if credentials are invalid.
- `500` on internal errors.

---

## Secret Manager APIs

These endpoints are currently implemented for testing the asymmetric encryption flow using AWS Secrets Manager.

### 4. Generate RSA Key Pair

- Method: `GET`
- Path: `/api/auth/sm-generate-public-key`
- Description: Generates a new RSA key pair and stores it in Secrets Manager. This should be used once to bootstrap the encryption flow.

#### Behavior

- Generates a 2048-bit RSA key pair.
- Stores both the public and private key into Secrets Manager under the configured secret ID.
- The private key remains secret and is used for decryption only.

#### Response

- `200` on success with Secrets Manager response.
- `500` on error.

---

### 5. Fetch Public Key

- Method: `GET`
- Path: `/api/auth/sm-public-key`
- Description: Retrieves the public key from Secrets Manager and returns it, usually for client-side encryption.

#### Behavior

- Fetches secrets from AWS Secrets Manager for the configured public key secret.
- Wraps the public key value in the standard success response.
- The key is returned in a format suitable for encryption.

#### Response

- `200` on success with public key data.
- `500` on error.

---

### 6. Fetch Secret Value by ID

- Method: `GET`
- Path: `/api/auth/sm-get-value`
- Description: Fetches a raw secret from Secrets Manager by secret ID. This API is used for inspection or testing.

#### Request Body

```json
{
  "sm_key": "YOUR_SECRET_ID"
}
```

#### Behavior

- Looks up the provided secret ID in Secrets Manager.
- Returns the value without decrypting or transforming it beyond parsing.

#### Response

- `200` on success with secret data.
- `400` if `sm_key` is missing.
- `500` on error.

---

### 7. Add or Update a Secret Key

- Method: `GET`
- Path: `/api/auth/sm-add-or-update-key`
- Description: Create or update an arbitrary key/value secret in Secrets Manager.

#### Request Body

```json
{
  "key": "SECRET_ID",
  "value": "some-secret-value"
}
```

#### Behavior

- Upserts the provided secret value into Secrets Manager.
- Supports arbitrary secret IDs for testing.

#### Response

- `200` on success with updated secret response.
- `400` if either `key` or `value` is missing.
- `500` on error.

---

### 8. Encrypt Value

- Method: `GET`
- Path: `/api/auth/sm-encrypt-value`
- Description: Encrypts a plaintext value using the configured public key from Secrets Manager.

#### Request Body

```json
{
  "value": "hello world"
}
```

#### Behavior

- Fetches the public key from Secrets Manager.
- Encrypts the plaintext using RSA OAEP SHA-256.
- Returns a base64-encoded encrypted string.

#### Response

- `200` on success with encrypted value.
- `400` if `value` is missing.
- `500` on error.

---

### 9. Decrypt Value

- Method: `GET`
- Path: `/api/auth/sm-decrypt-value`
- Description: Decrypts a base64-encrypted value using the private key stored in Secrets Manager.

#### Request Body

```json
{
  "encrypted_value": "BASE64_ENCRYPTED_STRING"
}
```

#### Behavior

- Fetches the private key from Secrets Manager.
- Decrypts with RSA OAEP SHA-256.
- Returns the original plaintext string.

#### Response

- `200` on success with decrypted data.
- `400` if `encrypted_value` is missing.
- `500` on error.

---

## Notes and Flow

- The registration flow is multi-step: register → verify OTP → login.
- The secret-manager flow is intended to support asymmetric encryption using Secrets Manager.
- Public-key encryption is used for encrypting data.
- Private-key decryption happens only on the server.
- The current API implementation is primarily testing-focused and may change as controller improvements are added.

---

## Environment Variables

The following environment variables are used by this project:

- `APP_PORT`
- `APP_URL`
- `LOCAL_BASE_URL`
- `MYSQL_DB_NAME`
- `MYSQL_DB_HOST`
- `MYSQL_DB_PORT`
- `MYSQL_DB_USER`
- `MYSQL_DB_PASSWORD`
- `JWT_SECRET_KEY`
- `MONGO_URI`
- `PROTECT_VALUE_ENCRYPTION_KEY`
- `PROTECT_VALUE_COMPARISON_KEY`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_PUBLIC_KEY_SECRET_ID`
- `AWS_PRIVATE_KEY_SECRET_ID`
- `AWS_SM_PRIVATE_KEY`

---

## How to Run

```bash
npm install
npm run dev
```

The server listens on the configured `APP_PORT`.

---

## Database Schema Map

This project uses a multi-database architecture with MySQL (Sequelize), MongoDB (Mongoose), and Redis.

### MySQL Database Tables

#### User Module

**1. user_register** - Temporary registration records with OTP verification
- `register_id` (UUID, PK) - Primary key
- `phone_number` (STRING(20), UNIQUE) - User phone number
- `password_hash` (STRING(255)) - Hashed password
- `otp_hash` (STRING(255)) - Hashed OTP
- `otp_expires_at` (BIGINT) - OTP expiration timestamp
- `submission_count` (INTEGER) - Registration submission attempts
- `submission_blocked` (BIGINT) - Block timestamp after 5 submissions
- `verify_count` (INTEGER) - OTP verification attempts
- `verify_blocked` (BIGINT) - Block timestamp after 5 failed verifications
- `created_at`, `updated_at` (TIMESTAMP)
- **Indexes:** `idx_user_register_verification` on `otp_expires_at`
- **Version:** 1.2.2

**2. user** - Main user accounts table
- `user_id` (UUID, PK) - Primary key
- `phone_number` (STRING(20), UNIQUE) - Verified phone number
- `password_hash` (STRING(255)) - Hashed password
- `access_token` (STRING(255)) - Current access token
- `created_at`, `updated_at` (TIMESTAMP)
- **Indexes:** `idx_user_phone_number` (unique)
- **Version:** 1.2.0

**3. user_profile** - Extended user profile information
- `profile_id` (UUID, PK) - Primary key
- `user_id` (UUID, FK → user.user_id, UNIQUE) - References user
- `email` (STRING(255)) - User email
- `name` (STRING(255)) - Full name (default: "User")
- `dob` (BIGINT) - Date of birth timestamp
- `gender` (INTEGER) - Gender code (1=Male, 2=Female, 3=Not Prefer, 4=Other)
- `profile_image_url` (STRING(255)) - Profile image URL
- `pin_code` (INTEGER) - Postal code
- `created_at`, `updated_at` (TIMESTAMP)
- **Indexes:** `idx_user_profile_user_id` on `user_id`
- **Version:** 1.1.5

#### Post Module

**4. post** - Core post records
- `post_id` (UUID, PK) - Primary key
- `posted_by_user_id` (UUID) - User who created post
- `posted_by_org_id` (UUID) - Organization who created post (optional)
- `delete_at` (BIGINT) - Soft delete timestamp
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

**5. status** - Post status lookup table
- `status_id` (INTEGER, PK, AUTO_INCREMENT) - Primary key
- `status_text` (STRING) - Status name (e.g., "published", "draft")
- `status_info` (STRING) - Status description
- **Version:** 1.1.1

**6. post_user_tag** - Junction table for tagging users in posts
- `post_user_tag_id` (UUID, PK) - Primary key
- `post_id` (UUID, FK) - References post
- `user_id` (UUID, FK) - References user
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

**7. post_org_tag** - Junction table for tagging organizations in posts
- `post_org_tag_id` (UUID, PK) - Primary key
- `post_id` (UUID, FK) - References post
- `org_id` (UUID, FK) - References organization
- `approved_by` (UUID) - User who approved the tag (optional)
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

#### Organization Module

**8. organization** - Organization master records
- `org_id` (UUID, PK) - Primary key
- `name` (STRING) - Organization name
- `email` (STRING, UNIQUE) - Organization email
- `contact_number` (BIGINT) - Contact phone number
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

**9. org_location** - Organization location details
- `org_location_id` (UUID, PK) - Primary key
- `org_id` (UUID, FK → organization.org_id, UNIQUE) - References organization
- `street` (STRING) - Street address
- `city` (STRING) - City
- `state` (STRING) - State/Province
- `country` (STRING) - Country
- `pin_code` (INTEGER) - Postal code
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

**10. org_member_position** - Organization member position lookup table
- `org_member_type_id` (INTEGER, PK, AUTO_INCREMENT) - Primary key
- `member_position` (STRING, UNIQUE) - Position name (e.g., "Admin", "Manager", "Member")
- **Version:** 1.1.1

**11. org_member** - Organization membership records
- `member_id` (UUID, PK) - Primary key
- `org_id` (UUID, FK) - References organization
- `user_id` (UUID, FK) - References user
- `org_member_type_id` (INTEGER, FK) - References org_member_position
- `created_at`, `updated_at` (TIMESTAMP)
- **Version:** 1.1.1

### MongoDB Collections

**1. refresh_token** - Refresh token management
- `_id` (ObjectId) - MongoDB primary key
- `user_id` (String) - References user.user_id
- `refreshTokenHash` (String) - Hashed refresh token
- `ip` (String) - Client IP address
- `userAgent` (String) - Client user agent
- `revoked` (Boolean) - Token revocation status (default: false)
- `createdAt`, `updatedAt` (Timestamp)

**2. post_info** - Extended post information (complementary to MySQL post table)
- `_id` (ObjectId) - MongoDB primary key
- `post_id` (UUID) - References post.post_id from MySQL
- `status_id` (UUID) - References status.status_id
- `caption` (String) - Post caption/description
- `images_url` (Array[String]) - List of image URLs
- `latitude` (Decimal128) - Geographic latitude
- `longitude` (Decimal128) - Geographic longitude
- `createdAt`, `updatedAt` (Timestamp)

### Redis

Redis is configured but primarily used for:
- Session management
- Caching
- Temporary data storage during OTP verification

---

## Entity Relationship Diagram (Text Format)

```
USERS DOMAIN:
└── user_register (pre-verification)
    └── (OTP verification process)
        └── user (main user table)
            ├── user_profile (1:1 relationship)
            ├── org_member (M:N relationship via org_member)
            └── post_user_tag (M:N relationship via post_user_tag)

POSTS DOMAIN:
└── post (main post table)
    ├── post_info (MongoDB, 1:1 relationship)
    ├── status (M:1 relationship)
    ├── post_user_tag (M:N tagging users)
    └── post_org_tag (M:N tagging organizations)

ORGANIZATIONS DOMAIN:
└── organization (main org table)
    ├── org_location (1:1 relationship)
    ├── org_member_position (lookup table)
    ├── org_member (M:N relationship with users)
    └── post_org_tag (M:N relationship via post_org_tag)

SESSION/AUTH:
└── refresh_token (MongoDB, user session tokens)
```

---

## Database Update Guidelines

When updating any table schema:
1. Make code changes in the model file
2. Update the `versionInfo` object with new version, description, and approver details
3. Set `databaseTableUpdateFlag` to `true` for that table in [src/db/mysql/index.js](src/db/mysql/index.js)
4. Set `databaseUpdateFlag` to `true` in [src/db/mysql/index.js](src/db/mysql/index.js)
5. Run migrations/sync
6. Revert both flags to `false` after successful update
