import mongoose, { model } from "mongoose";

const postImagesSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.UUID,
        required: [true, "Post is required"]
    },
    images_urls: {
        type: [String],
        required: [true, "Post Images are required"]
    },
}, {
    timestamps: true
});

const PostImagesModel = mongoose.model("post_info", postImagesSchema);


export default PostImagesModel;