import { Topic } from "../models/topicModel.js";
import { Chat } from "../models/chatModel.js";
import { getMessagesBeforeTimestamp } from "./messageCRUD.js";

export const createTopicWIthChatID = async (chatID, topicData) => {
  try {
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return { success: false, data: "Chat does not exist." };
    }
    const newTopic = new Topic(topicData);
    await newTopic.save();
    chat.topics.push(newTopic._id);
    await chat.save();
    return { success: true, data: newTopic };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getTopics = async (filter) => {
  try {
    await Promise.all(topics.map((topic) => topic.populate("messages")));
    return { success: true, data: topics };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getTopicById = async (id) => {
  try {
    const topic = await Topic.findById(id);
    const messages = await getMessagesBeforeTimestamp(id);
    topic.messages = messages;
    if (!topic) return { success: false, data: "Topic not found" };
    return { success: true, data: topic };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getTopicsByChatID = async (chatID) => {
  try {
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return { success: false, data: "Chat does not exist" };
    }
    return { success: true, data: chat.topics };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const updateTopicById = async (id, updateData) => {
  try {
    const updatedTopic = await Topic.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("messages");
    if (!updatedTopic) return { success: false, data: "Topic not found" };
    return { success: true, data: updatedTopic };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteTopicById = async (id) => {
  try {
    const deletedTopic = await Topic.findById(id);
    if (!deletedTopic) return { success: false, data: "Topic not found" };
    return { success: true, data: "Topic deleted successfully" };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteTopicByUserEmail = async (topicID, senderEmail) => {
  try {
    const topic = await Topic.findById(topicID);
    if (!topic) {
      return { success: false, data: "Topic not found." };
    }
    const senderIndex = topic.visibelTo.indexOf(senderEmail);
    if (senderIndex === -1) {
      return {
        success: false,
        data: "Sender is not a part of this topic.",
      };
    }
    topic.visibelTo.splice(senderIndex, 1);
    if (topic.visibelTo.length === 0) {
      await Promise.all(
        topic.messages.map((messageID) => Message.findByIdAndDelete(messageID))
      );
      await topic.deleteOne();
      return {
        success: true,
        data: "No participants were left, so the topic and its messages were deleted.",
      };
    } else {
      await topic.save();
      return {
        success: true,
        data: "Topic visibility updated. It is now deleted for the sender only.",
      };
    }
  } catch (error) {
    return { success: false, data: error.message };
  }
};
