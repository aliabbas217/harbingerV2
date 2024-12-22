import {
  createMessage,
  getMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} from "../dbCrud/messageCRUD.js";

export const postMessage = async (req, res) => {
  try {
    const { sender, text, media, status, timestamp } = req.body;
    const messageResponse = await createMessage({
      sender,
      text,
      media,
      status,
      timestamp,
    });
    if (!messageResponse.success) {
      return res.status(400).json({
        success: false,
        data: `Message creation failed: ${messageResponse.error}`,
      });
    }
    res.status(201).json({ success: true, data: messageResponse.message });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const response = await getMessages({});
    if (!response.success) {
      return res.status(400).json({ success: false, data: response.error });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const response = await getMessage({ _id: messageId });
    if (!response.success) {
      return res
        .status(404)
        .json({ success: false, data: "Message not found" });
    }

    const message = response.data;
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const updateData = req.body;
    const response = await updateMessage(messageId, updateData);
    if (!response.success || !response.data) {
      return res
        .status(404)
        .json({ success: false, data: "Message not found" });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.body.messageId;
    const response = await deleteMessage({ _id: messageId });
    if (!response.success || !response.data) {
      return res
        .status(404)
        .json({ success: false, data: "Message not found" });
    }
    res.json({ success: true, data: "Message deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};
