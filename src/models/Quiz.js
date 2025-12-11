import { Schema } from "mongoose";
import mongoose from "mongoose";

const QuizSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", default: null },

  answers: { type: Object, required: true },

  status: {
    type: String,
    enum: ["pending", "processing", "done", "failed"],
    default: "pending"
  },

  songCount: { type: Number, default: 15 },
  vibeDetails: { type: Object, default: null },
  isPremiumRequested: Boolean,

}, { timestamps: true });

export default mongoose.model("Quiz", QuizSchema);
