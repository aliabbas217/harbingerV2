import mongoose from "mongoose";
const TopicSchema = new mongoose.Schema({
  topicName: { type: String, required: true, default: "General" },
  createdBy: {
    type: String,
    required: true,
  },
  visibelTo: [{ tyepe: String }],
  dateCreated: { type: Date, default: Date.now },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

export const Topic = mongoose.model("Topic", TopicSchema);
