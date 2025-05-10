import { Request, Response } from "express";
import { PrismaClient as HorizonClient } from "../prisma/generated/horizon/index.js";
import { z } from "zod";

const horizon = new HorizonClient();

const topicSchema = z.object({
  topicName: z.string().min(1, "Topic name cannot be empty."),
  createdBy: z.string(), // Person ID
  visibleTo: z
    .array(z.string())
    .min(1, "Topic must be visible to at least one person."), // Array of Person IDs
  chatId: z.string(), // Should be a valid Chat ID
});

export const createTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationResult = topicSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Validation error",
      });
      return;
    }

    const { chatId } = validationResult.data;
    const chatExists = await horizon.chat.findUnique({ where: { id: chatId } });
    if (!chatExists) {
      res.status(404).json({ success: false, message: "Chat not found." });
      return;
    }

    const createdTopic = await horizon.topic.create({
      data: validationResult.data,
    });
    res
      .status(201)
      .json({ success: true, data: createdTopic, message: "Topic created" });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllTopics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topics = await horizon.topic.findMany();
    if (topics.length === 0) {
      res
        .status(200)
        .json({ success: true, data: [], message: "No topics found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: topics, message: "Topics found" });
  } catch (error) {
    console.error("Error getting all topics:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTopicByTopicId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topic = await horizon.topic.findUnique({
      where: { id: topicId },
    });
    if (!topic) {
      res.status(404).json({ success: false, message: "Topic not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: topic, message: "Topic found" });
  } catch (error) {
    console.error("Error getting topic by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTopicsByChatId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const chat = await horizon.chat.findUnique({
      where: { id: chatId },
      include: {
        topics: true,
      },
    });

    if (!chat) {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }

    res
      .status(200)
      .json({
        success: true,
        data: chat.topics,
        message: "Topics found for chat",
      });
  } catch (error) {
    console.error("Error getting topics by chat ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteTopicByTopicId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topic = await horizon.topic.delete({
      where: { id: topicId },
    });
    res
      .status(200)
      .json({
        success: true,
        data: topic,
        message: "Topic deleted successfully",
      });
  } catch (error: any) {
    console.error("Error deleting topic by ID:", error);
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Topic not found" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

// Renamed userId to personId
export const deleteTopicByTopicIdAndPersonId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topicId, personId } = req.params; // Changed from userId

    const topic = await horizon.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      res.status(404).json({ success: false, message: "Topic not found" });
      return;
    }

    if (!topic.visibleTo.includes(personId)) {
      // Changed from userId
      res
        .status(400)
        .json({
          success: false,
          message: "Person is not in the topic's visibility list.",
        });
      return;
    }

    const updatedVisibleTo = topic.visibleTo.filter(
      (userInList) => userInList !== personId
    ); // Changed from userId

    if (updatedVisibleTo.length === 0) {
      await horizon.topic.delete({
        where: { id: topicId },
      });
      res.status(200).json({
        success: true,
        message:
          "Person removed from topic visibility; topic deleted as it became invisible.",
      });
    } else {
      const updatedTopic = await horizon.topic.update({
        where: { id: topicId },
        data: { visibleTo: updatedVisibleTo },
      });
      res.status(200).json({
        success: true,
        data: updatedTopic,
        message: "Person removed from topic visibility.",
      });
    }
  } catch (error) {
    console.error("Error in deleteTopicByTopicIdAndPersonId:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
