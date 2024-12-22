import { Message } from "../models/messageModel.js";
import { Topic } from "../models/topicModel.js";

export const createMessage = async (messageData) => {
  try {
    const newMessage = new Message(messageData);
    const data = await newMessage.save();
    console.log(data);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getMessages = async (filter) => {
  try {
    const messages = await Message.find(filter);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getMessageById = async (id) => {
  try {
    const message = await Message.findById(id);
    if (!message) return { success: false, data: "Message not found" };
    return { success: true, message };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const updateMessageById = async (id, updateData) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedMessage) return { success: false, data: "Message not found" };
    return { success: true, data: updatedMessage };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteMessageById = async (id) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    if (!deletedMessage) return { success: false, data: "Message not found" };
    return { success: true, data: "Message deleted successfully" };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getMessagesBeforeTimestamp = async (
  topicID,
  timestamp = Date.now(),
  limit = 50
) => {
  try {
    const topic = await Topic.findById(topicID);
    if (!topic) {
      return { success: false, data: "Topic not found" };
    }
    const messages = await Message.find({
      _id: { $in: topic.messages },
      timestamp: { $lt: timestamp },
    })
      .sort({ timestamp: -1 })
      .limit(limit);
    return { success: true, data: messages };
  } catch (error) {
    return { success: false, data: error.message };
  }
};
