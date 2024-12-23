import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Topic } from "../models/topicModel.js";
import { Message } from "../models/messageModel.js";

export const getTopicsByChatID = async (req, res) => {
  try {
    const { chatID } = req.params;
    const chat = await Chat.findById(chatID).populate("topics");
    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }
    const topics = chat.topics;
    return res.status(200).json({ success: true, data: topics });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find({});
    return res.status(200).json({ success: true, data: topics });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAllTopics = async (req, res) => {
  try {
    await Topic.deleteMany({});
    return res
      .status(200)
      .json({ success: true, data: "Successfully deleted all the topics" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getTopicByID = async (req, res) => {
  try {
    const { topicID } = req.params;
    const topic = await Topic.findById(topicID).populate("messages");
    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic not found" });
    }
    return res.status(200).json({ success: true, data: topic });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createTopicByChatID = async (req, res) => {
  try {
    const { chatID } = req.params;
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, error: "Chat does not exist." });
    }
    const topic = new Topic({
      topicName: req.body.topicName | "general",
      createdBy: req.body.createdBy,
      visibleTo: chat.participants,
    });
    await topic.save();
    chat.topics.push(topic._id);
    await chat.save();
    return res.status(200).json({ success: true, data: topic });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTopicsByChatID = async (req, res) => {
  try {
    const { chatID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatID)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid chat ID format." });
    }
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found." });
    }
    const topics = chat.topics;
    if (topics.length > 0) {
      await Topic.deleteMany({ _id: { $in: topics } });
    }
    chat.topics = [];
    await chat.save();
    return res
      .status(200)
      .json({ success: true, data: "Topics deleted successfully." });
  } catch (error) {
    console.error("Error deleting topics by chat ID:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

export const deleteTopicByTopicID = async (req, res) => {
  try {
    const { chatID, topicID } = req.params;
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found." });
    }
    const topicIndex = chat.topics.indexOf(topicID);
    if (topicIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Topic not found in the chat." });
    }
    chat.topics.splice(topicIndex, 1);
    await chat.save();
    await Topic.findByIdAndDelete(topicID);
    return res
      .status(200)
      .json({ success: true, data: "Topic deleted successfully." });
  } catch (error) {
    console.error("Error deleting topic by topic ID:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error." });
  }
};

export const deleteTopicByUserEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const topicID = req.params.topicID;
    const topic = await Topic.findById(topicID);
    const userIndex = topic.visibleTo.indexOf(email);
    if (userIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "User is not a part of this topic" });
    }
    topic.visibleTo.splice(userIndex, 1);
    if (topic.visibleTo.length === 0) {
      await topic.deleteOne();
      return res.status(200).json({
        success: true,
        data: "No one left in the topic so it got deleted.",
      });
    }
    await topic.save();
    return res
      .status(200)
      .json({ success: true, data: "Topic deleted for sender" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTopicByTopicID = async (req, res) => {
  try {
    const updates = await Topic.findByIdAndUpdate(
      req.params.topicID,
      req.body,
      { new: true }
    );
    if (!updates) {
      return res
        .status(400)
        .json({ success: false, error: "Could not update Topic" });
    }
    return res.status(200).json({ success: true, data: updates });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
