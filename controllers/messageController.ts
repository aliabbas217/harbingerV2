import { Request, Response } from "express";
import {
  PrismaClient as HorizonClient,
  MediaType,
  MessageStatus,
} from '@prisma/client'
import { z } from "zod";

const horizon = new HorizonClient();

const createMessageSchema = z.object({
  sender: z.string(),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
  topicId: z.string(),
});

const updateMessageSchema = z.object({
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.nativeEnum(MediaType).optional(),
  status: z.nativeEnum(MessageStatus).optional(),
});

export const createMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationResult = createMessageSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Validation error",
      });
      return;
    }

    const { sender, topicId, text, mediaUrl, mediaType } =
      validationResult.data;

    const topic = await horizon.topic.findUnique({
      where: { id: topicId },
      include: { chat: { select: { participants: true } } },
    });

    if (!topic) {
      res.status(404).json({ success: false, message: "Topic not found" });
      return;
    }

    if (!topic.chat.participants.includes(sender)) {
      res.status(403).json({
        success: false,
        message: "Sender is not authorized to post in this topic.",
      });
      return;
    }

    const newMessage = await horizon.message.create({
      data: {
        sender,
        topicId,
        text,
        mediaUrl,
        mediaType,
        visibleTo: topic.chat.participants,
      },
    });
    res
      .status(201)
      .json({ success: true, data: newMessage, message: "Message created" });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const messages = await horizon.message.findMany({
      orderBy: { timestamp: "desc" },
    });

    if (messages.length === 0) {
      res
        .status(200)
        .json({ success: true, data: [], message: "No messages found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: messages, message: "Messages found" });
  } catch (error) {
    console.error("Error getting all messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const message = await horizon.message.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    res
      .status(200)
      .json({ success: true, data: message, message: "Message found" });
  } catch (error) {
    console.error("Error getting message by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllMessagesByTopicId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topic = await horizon.topic.findUnique({
      where: { id: topicId },
      select: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!topic) {
      res.status(404).json({ success: false, message: "Topic not found" });
      return;
    }

    if (!topic.messages || topic.messages.length === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "No messages found for this topic",
      });
      return;
    }

    res
      .status(200)
      .json({ success: true, data: topic.messages, message: "Messages found" });
  } catch (error) {
    console.error("Error getting messages by topic ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const validationResult = updateMessageSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Validation error",
      });
      return;
    }

    const updatedMessage = await horizon.message.update({
      where: { id: messageId },
      data: validationResult.data,
    });
    res.status(200).json({
      success: true,
      data: updatedMessage,
      message: "Message updated",
    });
  } catch (error: any) {
    console.error("Error updating message:", error);
    if (error.code === "P2025") {
      res
        .status(404)
        .json({ success: false, message: "Message not found to update" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

export const deleteMessageById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await horizon.message.delete({
      where: { id: messageId },
    });
    res.status(200).json({
      success: true,
      data: deletedMessage,
      message: "Message deleted",
    });
  } catch (error: any) {
    console.error("Error deleting message:", error);
    if (error.code === "P2025") {
      res
        .status(404)
        .json({ success: false, message: "Message not found to delete" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

export const deleteAllMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedResult = await horizon.message.deleteMany();
    res.status(200).json({
      success: true,
      data: { count: deletedResult.count },
      message: "All messages deleted",
    });
  } catch (error) {
    console.error("Error deleting all messages:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteAllMessagesByTopicId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { topicId } = req.params;
    const topicExists = await horizon.topic.findUnique({
      where: { id: topicId },
    });
    if (!topicExists) {
      res.status(404).json({ success: false, message: "Topic not found." });
      return;
    }

    const deletedResult = await horizon.message.deleteMany({
      where: { topicId: topicId },
    });
    res.status(200).json({
      success: true,
      data: { count: deletedResult.count },
      message: `All messages for topic ${topicId} deleted`,
    });
  } catch (error) {
    console.error("Error deleting messages by topic:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteMessagesByPersonId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { personId } = req.params;
    const person = await horizon.person.findUnique({
      where: { id: personId },
    });
    if (!person) {
      res.status(404).json({ success: false, message: "Person not found" });
      return;
    }

    const deletedResult = await horizon.message.deleteMany({
      where: { sender: personId },
    });
    res.status(200).json({
      success: true,
      data: { count: deletedResult.count },
      message: `All messages sent by person ${personId} deleted`,
    });
  } catch (error) {
    console.error("Error deleting messages by person:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteMessageByMessageIdAndPersonId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { messageId, personId } = req.params;
    const message = await horizon.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }

    if (message.sender !== personId) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own messages.",
      });
      return;
    }

    const deletedMessage = await horizon.message.delete({
      where: { id: messageId },
    });
    res.status(200).json({
      success: true,
      data: deletedMessage,
      message: "Message deleted successfully by sender",
    });
  } catch (error: any) {
    console.error("Error in deleteMessageByMessageIdAndPersonId:", error);
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Message not found" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};
