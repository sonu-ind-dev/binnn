import mongoose, { model } from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: [true, "User is required"]
    },
    refreshTokenHash: {
        type: String,
        required: [true, "Refresh token hash is required"]
    },
    ip: {
        type: String,
        required: [true, "IP address is required"]
    },
    userAgent: {
        type: String,
        required: [true, "User agent is required"]
    },
    revoked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const RefreshTokenModel = mongoose.model("refresh_token", refreshTokenSchema);


export default RefreshTokenModel;