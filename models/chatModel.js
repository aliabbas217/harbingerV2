const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: new Date(Date.now()) },
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [MessageSchema],
});

module.exports = mongoose.model("Chat", ChatSchema);