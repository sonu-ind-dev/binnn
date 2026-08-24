import mongoose, { model } from "mongoose";

const postInfoSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.UUID,
        required: [true, "Post is required"]
    },
    status_id: {
        type: mongoose.Schema.Types.Int32,
        default: 0,
    },
    caption: {
        type: String,
    },
    images_url: {
        type: [String],
        required: [true, "Post Images are required"]
    },
    latitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, "Post Latitude is required"]
    },
    longitude: {
        type: mongoose.Schema.Types.Decimal128,
        required: [true, "Post Longitude is required"]
    }
}, {
    timestamps: true
});

const PostInfoModel = mongoose.model("post_info", postInfoSchema);


export default PostInfoModel;