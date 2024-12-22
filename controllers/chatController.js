import {
  createChat,
  getChat,
  getChats,
  updateChat,
  deleteChat,
} from "../dbCrud/chatCRUD.js";

export const postChat = async (req, res) => {
  try {
    const { participants, topics } = req.body;
    const chatResponse = await createChat({ participants, topics });
    if (!chatResponse.success) {
      return res.status(400).json({
        success: false,
        data: `Chat creation failed: ${chatResponse.error}`,
      });
    }
    res.status(201).json({ success: true, data: chatResponse.chat });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const response = await getChats({});
    if (!response.success) {
      return res.status(400).json({ success: false, data: response.error });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const chatId = req.body.chatId;
    const response = await getChat({ _id: chatId });
    if (!response.success) {
      return res.status(404).json({ success: false, data: "Chat not found" });
    }

    const chat = response.data;
    await chat.populate({
      path: "topics",
      populate: {
        path: "messages",
      },
    });
    res.json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const chatId = req.body.chatId;
    const updateData = req.body;
    const response = await updateChat(chatId, updateData);
    if (!response.success || !response.data) {
      return res.status(404).json({ success: false, data: "Chat not found" });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chatId = req.body.chatId;
    const response = await deleteChat({ _id: chatId });
    if (!response.success || !response.data) {
      return res.status(404).json({ success: false, data: "Chat not found" });
    }
    res.json({ success: true, data: "Chat deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};
