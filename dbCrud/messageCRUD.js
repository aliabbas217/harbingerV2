import { Topic } from "../models/topicModel.js";
import { Message } from "../models/messageModel.js";

export const getMessagesByTopicID = async (req, res) => {
  try {
    const { topicID } = req.params;
    const { limit = 100, timestamp = Date.now() } = req.query;
    const dateLimit = new Date(timestamp);
    const topic = await Topic.findById(topicID).populate({
      path: "messages",
      match: { createdAt: { $lt: dateLimit } },
      options: { limit, sort: { createdAt: -1 } },
    });
    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic Not Found" });
    }
    return res.status(200).json({ success: true, data: topic.messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({});
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMessagesByTopicID = async (req, res) => {
  try {
    const topicID = req.params.topicID;
    const topic = await Topic.findById(topicID);
    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic Not Found" });
    }
    const messages = topic.messages;
    await Promise.all(
      messages.map(async (message) => {
        await Message.findByIdAndDelete(message);
      })
    );
    topic.messages = [];
    await topic.save();
    return res
      .status(200)
      .json({ success: true, data: "Messages deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMessageByID = async (req, res) => {
  try {
    const messageID = req.params.messageID;
    const topicID = req.params.topicID;
    const topic = await Topic.findById(topicID);
    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic Not Found" });
    }
    const messageIndex = topic.messages.indexOf(messageID);
    if (messageIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: "Message Not in the Topic" });
    }
    topic.messages.splice(messageIndex, 1);
    await topic.save();
    await Message.findByIdAndDelete(messageID);
    return res
      .status(200)
      .json({ success: true, data: "Message Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createMessageByTopicID = async (req, res) => {
  try {
    const topicID = req.params.topicID;
    const topic = await Topic.findById(topicID);
    if (!topic) {
      return res.status(404).json({ success: false, error: "Topic Not Found" });
    }
    const message = new Message(req.body.message);
    await message.save();
    topic.messages.push(message._id);
    await topic.save();
    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMessageByID = async (req, res) => {
  try {
    const messageID = req.params.messageID;
    const update = await Message.findByIdAndUpdate(messageID, req.body.update, {
      new: true,
    });
    if (!update) {
      return req.status(404).json({ success: false, error: "Update Failed." });
    }
    return req.status(200).json({ success: true, data: update });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAllMessages = async (req, res) => {
  try {
    await Message.deleteMany({});
    return res
      .status(200)
      .json({ success: true, data: "All Messages Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
