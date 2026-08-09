import mongoose from "mongoose";
import config from "../../config/config.js";

export const initializeMongoCollections = async () => {
    await mongoose.connect(config.MONGO_URI);

    console.log("CONNECTED: Connected to MongoDB server");
}