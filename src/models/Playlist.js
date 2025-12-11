import { Schema } from "mongoose";
import mongoose from "mongoose";

const PlaylistSchema = new Schema({
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", default: null },
  
  title: String,
  description: String,
  tracks: Array,
  spotifyUrl: String,
  songCount: Number,
  playlistType: { type: String, enum: ["default", "premium"], default: "default" },

}, { timestamps: true });

export default mongoose.model("Playlist", PlaylistSchema);
