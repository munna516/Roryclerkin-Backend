import { Schema } from "mongoose";
import mongoose from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String },
        email: { type: String, unique: true, required: true },
        password: { type: String, },
        type: { type: String, enum: ["guest", "user"], },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);