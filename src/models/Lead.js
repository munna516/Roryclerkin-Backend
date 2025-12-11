import { Schema } from "mongoose";
import mongoose from "mongoose";

const LeadSchema = new Schema({
    email: { type: String, required: true, unique: true },  
}, { timestamps: true });

export default mongoose.model("Lead", LeadSchema);
