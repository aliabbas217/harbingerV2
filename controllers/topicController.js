import {
  createTopic,
  getTopic,
  getTopics,
  updateTopic,
  deleteTopic,
} from "../dbCrud/topicCRUD.js";

export const postTopic = async (req, res) => {
  try {
    const { topicName, createdBy, messages } = req.body;
    const topicResponse = await createTopic({ topicName, createdBy, messages });
    if (!topicResponse.success) {
      return res.status(400).json({
        success: false,
        data: `Topic creation failed: ${topicResponse.error}`,
      });
    }
    res.status(201).json({ success: true, data: topicResponse.topic });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getAllTopics = async (req, res) => {
  try {
    const response = await getTopics({});
    if (!response.success) {
      return res.status(400).json({ success: false, data: response.error });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getTopic = async (req, res) => {
  try {
    const topicId = req.body.topicId;
    const response = await getTopic({ _id: topicId });
    if (!response.success) {
      return res.status(404).json({ success: false, data: "Topic not found" });
    }

    const topic = response.data;
    await topic.populate({
      path: "messages",
    });
    res.json({ success: true, data: topic });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const topicId = req.body.topicId;
    const updateData = req.body;
    const response = await updateTopic(topicId, updateData);
    if (!response.success || !response.data) {
      return res.status(404).json({ success: false, data: "Topic not found" });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const topicId = req.body.topicId;
    const response = await deleteTopic({ _id: topicId });
    if (!response.success || !response.data) {
      return res.status(404).json({ success: false, data: "Topic not found" });
    }
    res.json({ success: true, data: "Topic deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};
