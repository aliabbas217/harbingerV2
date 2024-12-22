import { Chat } from "../models/chatModel.js";
import { User } from "../models/userModel.js";
import { Topic } from "../models/topicModel.js";

export const createChatBySenderID = async (senderID, chatData) => {
  try {
    const sender = await User.findById(senderID);
    if (!sender) {
      return { success: false, data: "Sender does not exist." };
    }
    let receiverEmail = null;
    for (let participant of chatData.participants) {
      if (sender.email == participant) {
        continue;
      } else {
        receiverEmail = participant;
      }
    }
    if (!receiverEmail) {
      return { success: false, data: "Receiver email not found." };
    }
    const receiver = await User.findOne({ receiverEmail });
    if (!receiver) {
      return { success: false, data: "Receiver does not exist." };
    }
    const newChat = new Chat(chatData);
    await newChat.save();
    const updatedSender = await User.findByIdAndUpdate(
      senderID,
      { $push: { chats: newChat._id } },
      { new: true }
    );
    await receiver.chats.push(newChat._id);
    await receiver.save();
    return { success: true, data: { newChat, updatedSender, receiver } };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getChatsBySenderID = async (senderID) => {
  try {
    const sender = User.findById(senderID);
    if (!sender) {
      return { success: false, data: "Sender does not exist." };
    }
    const chats = sender.chats;
    await Promise.all(chats.map((chat) => chat.populate("topics")));
    return { success: true, data: chats };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getChats = async (filter) => {
  try {
    const chats = await Chat.find(filter);
    await Promise.all(chats.map((chat) => chat.populate("topics")));
    return { success: true, data: chats };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getChatById = async (id) => {
  try {
    const chat = await Chat.findById(id).populate({
      path: "topics",
    });
    if (!chat) return { success: false, data: "Chat not found" };
    return { success: true, data: chat };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const updateChatById = async (id, updateData) => {
  try {
    const updatedChat = await Chat.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("topics");
    if (!updatedChat) return { success: false, data: "Chat not found" };
    return { success: true, data: updatedChat };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteChatById = async (id) => {
  try {
    const chatToDelete = await Chat.findById(id);
    if (!chatToDelete) {
      return { success: false, data: "Chat not found" };
    }
    const topics = chatToDelete.topics;
    await Promise.all(
      topics.map(async (topicId) => {
        const topic = await Topic.findById(topicId);
        if (topic) {
          await Promise.all(
            topic.messages.map((messageId) =>
              Message.findByIdAndDelete(messageId)
            )
          );
        }
      })
    );
    await Promise.all(
      topics.map((topicId) => Topic.findByIdAndDelete(topicId))
    );
    await Chat.findByIdAndDelete(id);
    return {
      success: true,
      data: "Chat and related data deleted successfully",
    };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteChatBySenderID = async (senderID, chatID) => {
  try {
    const user = await User.findById(senderID);
    if (!user) {
      return { success: false, data: "User not found 2" };
    }
    const chatIndex = user.chats.indexOf(chatID);
    if (chatIndex === -1) {
      return { success: false, data: "Chat not found in user's chats" };
    }
    user.chats.splice(chatIndex, 1);
    await user.save();
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return { success: false, data: "Chat not found" };
    }
    const senderIndex = chat.participants.indexOf(user.email);
    if (senderIndex === -1) {
      return {
        success: false,
        data: "User not present in the chat's participants",
      };
    }
    chat.participants.splice(senderIndex, 1);

    if (chat.participants.length === 0) {
      await Chat.findByIdAndDelete(chatID);
      return {
        success: true,
        data: "Chat deleted as no participants are left",
      };
    } else {
      await chat.save();
    }
    return { success: true, data: "Chat removed from user's chats" };
  } catch (error) {
    return { success: false, data: error.message };
  }
};
