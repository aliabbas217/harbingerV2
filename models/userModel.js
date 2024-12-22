import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
});

export const User = mongoose.model("User", UserSchema);
