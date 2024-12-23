import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Topic } from "../models/topicModel.js";
import { Message } from "../models/messageModel.js";

export const createChatByUserID = async (req, res) => {
  try {
    const senderID = req.params.userID;
    const receiverEmail = req.body.receiver;
    const sender = await User.findById(senderID);
    if (!sender) {
      return res
        .status(404)
        .json({ success: false, error: "Sender Not Found" });
    }
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res
        .status(404)
        .json({ success: false, error: "Receiver not found." });
    }

    const message = new Message({
      sender: sender.email,
      text: "Hello, Welcome to Harbinger.",
    });
    await message.save();
    const topic = new Topic({
      createdBy: sender.email,
      visibleTo: [sender.email, receiverEmail],
      messages: [message._id],
    });
    await topic.save();
    const chat = new Chat({
      participants: [sender.email, receiverEmail],
      topics: [topic._id],
    });
    await chat.save();
    sender.chats.push(chat);
    await sender.save();
    receiver.chats.push(chat);
    await receiver.save();
    return res.status(200).json({ success: true, data: chat });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllChatsByUserID = async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID).populate("chats");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const { chats } = user;
    if (!chats || chats.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ success: false, error: "Server error." });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({});
    if (chats.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }
    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAllChatsByUserID = async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const chats = user.chats;
    await Promise.all(
      chats.map(async (chatID) => {
        const updatedChat = await Chat.findByIdAndUpdate(
          chatID,
          {
            $pull: { participants: user.email },
          },
          {
            new: true,
          }
        );
        if (updatedChat && updatedChat.participants.length === 0) {
          await updatedChat.deleteOne();
        }
      })
    );
    user.chats = [];
    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User removed from all chats." });
  } catch (error) {
    console.error("Error deleting chats for user:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteChatByUserID = async (req, res) => {
  try {
    const senderID = req.params.userID;
    const chatID = req.params.chatID;
    const user = await User.findById(senderID);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Sender user not found." });
    }
    const chat = await Chat.findById(chatID);
    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found." });
    }
    const updatedChat = await Chat.findByIdAndUpdate(
      chatID,
      {
        $pull: { participants: user.email },
      },
      { new: true }
    );
    if (updatedChat.participants.length === 0) {
      await updatedChat.deleteOne();
      return res.status(200).json({
        success: true,
        message: "Chat deleted as it had no participants left.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User removed from chat successfully.",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({});
    await User.updateMany({}, { chats: [] });
    return res
      .status(200)
      .json({ success: true, data: "Chats Deleted Successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
