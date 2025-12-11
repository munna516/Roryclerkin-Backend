
import { Schema } from "mongoose";
import mongoose from "mongoose";

const UserSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);