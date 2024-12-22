import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
});

export const Chat = mongoose.model("Chat", ChatSchema);
