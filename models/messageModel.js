import mongoose from "mongoose";
const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String },
  media: {
    url: String,
    mediaType: {
      type: String,
      enum: ["jpg", "png", "pdf", "gif", "other", null],
      default: null,
    },
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "seen", "error", "sending"],
    default: "sending",
  },
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", MessageSchema);
