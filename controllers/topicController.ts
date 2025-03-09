import { Request, Response } from "express";
import { PrismaClient as HarbingerClient } from "/home/ali-abbas/Documents/learn/harbinger/prisma/generated/harbinger/index.js";

import { z } from "zod";

const harbinger = new HarbingerClient();

/*
model Topic {
    id          String    @id @default(auto()) @map("_id") @db.ObjectId
    topicName   String
    createdBy   String
    visibleTo   String[]
    dateCreated DateTime  @default(now())
    messages    Message[] @relation("TopicMessages")
    chatId      String    @db.ObjectId
    chat        Chat      @relation("ChatTopics", fields: [chatId], references: [id], onDelete: Cascade)
  }
*/

// topic schema
const topicSchema = z.object({
  topicName: z.string(),
  createdBy: z.string(),
  visibleTo: z.array(z.string()).min(1).max(2),
  chatId: z.string(),
});

// Create Topic
export const createTopic = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const topic = topicSchema.safeParse(req.body);
    if (!topic.success) {
      res
        .status(400)
        .json({
          success: false,
          data: topic.error,
          message: "Validation error",
        })
        .end();
      return;
    }
    const createdTopic = await harbinger.topic.create({
      data: topic.data,
    });
    res.status(200).json({ success: true, data: createdTopic }).end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Get all topics
export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await harbinger.topic.findMany();
    if (!topics) {
      res
        .status(404)
        .json({ success: false, data: null, message: "No topics found" })
        .end();
      return;
    }
    res
      .status(200)
      .json({ success: true, data: topics, message: "Topics found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Get topic by id
export const getTopicByTopicId = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const topic = await harbinger.topic.findUnique({
      where: {
        id: topicId,
      },
    });
    if (!topic) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Topic not found" })
        .end();
      return;
    }
    res
      .status(200)
      .json({ success: true, data: topic, message: "Topic found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// get all topics by chat id
export const getTopicsByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await harbinger.chat.findUnique({
      where: {
        id: chatId,
      },
      include: {
        topics: true,
      },
    });

    if (!chat) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Chat not found" })
        .end();
      return;
    }
    const topics = await harbinger.topic.findMany({
      where: {
        id: {
          in: chat.topics.map((topic) => topic.id),
        },
      },
    });
    res
      .status(200)
      .json({ success: true, data: topics, message: "Topics found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// delete topic by id
export const deleteTopicByTopicId = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const topic = await harbinger.topic.delete({
      where: {
        id: topicId,
      },
    });
    res
      .status(200)
      .json({ success: true, data: topic, message: "Topic deleted" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// delete topic by topic id and user id (visibility settings)
export const deleteTopicByTopicIdAndUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { topicId, userId } = req.params;
    const topic = await harbinger.topic.findUnique({
      where: {
        id: topicId,
      },
    });
    if (!topic) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Topic not found" })
        .end();
      return;
    }
    const updatedVisibleTo = topic.visibleTo.filter((user) => user !== userId);
    if (updatedVisibleTo.length === 0) {
      res
        .status(400)
        .json({
          success: false,
          data: null,
          message: "Topic not visible to user",
        })
        .end();
      return;
    }
    const updatedTopic = await harbinger.topic.update({
      where: {
        id: topicId,
      },
      data: {
        visibleTo: updatedVisibleTo,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: updatedTopic,
        message: "Topic deleted for user",
      })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};
