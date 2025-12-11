import dotenv from "dotenv";
dotenv.config();

export const constants = {
    PORT: process.env.PORT || 3000,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "*",
    MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
}

export default constants;