import { Request, Response } from "express";
import { PrismaClient as HorizonClient } from "../prisma/generated/horizon/index.js";
import { z } from "zod";

const horizon = new HorizonClient();

/*
model Message {
  id        String        @id @default(auto()) @map("_id") @db.ObjectId
  sender    String
  text      String?
  mediaUrl  String?
  mediaType MediaType?
  status    MessageStatus @default(SENDING)
  timestamp DateTime      @default(now())
  topicId   String        @db.ObjectId
  topic     Topic         @relation("TopicMessages", fields: [topicId], references: [id], onDelete: Cascade)
  visibleTo String[]
}

enum MediaType {
  JPG
  PNG
  PDF
  GIF
  OTHER
}

enum MessageStatus {
  SENT
  DELIVERED
  SEEN
  ERROR
  SENDING
}
*/

const messageSchema = z.object({
  sender: z.string(),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(["JPG", "PNG", "PDF", "GIF", "OTHER"]).optional(),
  status: z
    .enum(["SENT", "DELIVERED", "SEEN", "ERROR", "SENDING"])
    .default("SENDING"),
  timestamp: z.date().default(new Date()),
  topicId: z.string(),
  visibleTo: z.array(z.string()),
});

// Create a new message
export const createMessage = async (req: Request, res: Response) => {
  try {
    const message = messageSchema.safeParse(req.body);
    if (!message.success) {
      res
        .status(400)
        .json({
          success: false,
          data: message.error,
          message: "Validation error",
        })
        .end();
      return;
    }

    const topic = await horizon.topic.findUnique({
      where: {
        id: message.data.topicId,
      },
    });

    if (!topic) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Topic not found" })
        .end();
      return;
    }

    const newMessage = await horizon.message.create({
      data: {
        sender: message.data.sender,
        text: message.data.text,
        mediaUrl: message.data.mediaUrl,
        mediaType: message.data.mediaType,
        status: message.data.status,
        timestamp: message.data.timestamp,
        topicId: message.data.topicId,
        visibleTo: message.data.visibleTo,
      },
    });
    res
      .status(201)
      .json({ success: true, data: newMessage, message: "Message created" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// get all messages
export const getAllMessages = async (req: Request, res: Response) => {
  try {
    const messages = await horizon.message.findMany();
    if (!messages) {
      res
        .status(404)
        .json({ success: true, data: null, message: "No messages found" })
        .end();
      return;
    }
    res
      .status(200)
      .json({ success: true, data: messages, message: "Messages found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// get message by id
export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = await horizon.message.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!message) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Message not found" })
        .end();
      return;
    }
    res
      .status(200)
      .json({ success: true, data: message, message: "Message found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// get all messages for a topic
export const getAllMessagesByTopicId = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const topic = await horizon.topic.findUnique({
      where: {
        id: topicId,
      },
      select: {
        messages: true,
      },
    });
    if (!topic) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Topic not found" })
        .end();
      return;
    }

    const messages = await horizon.message.findMany({
      where: {
        id: {
          in: topic.messages.map((message: { id: string }) => message.id),
        },
      },
    });

    if (!messages) {
      res
        .status(404)
        .json({ success: false, data: null, message: "No messages found" })
        .end();
      return;
    }
    res
      .status(200)
      .json({ success: true, data: messages, message: "Messages found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// update message by id
export const updateMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const message = messageSchema.safeParse(req.body);
    if (!message.success) {
      res
        .status(400)
        .json({
          success: false,
          data: message.error,
          message: "Validation error",
        })
        .end();
      return;
    }
    const updatedMessage = await horizon.message.update({
      where: {
        id: messageId,
      },
      data: message.data,
    });
    res
      .status(200)
      .json({
        success: true,
        data: updatedMessage,
        message: "Message updated",
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

// delete message by id
export const deleteMessageById = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await horizon.message.delete({
      where: {
        id: messageId,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: deletedMessage,
        message: "Message deleted",
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

// delete all messages
export const deleteAllMessages = async (req: Request, res: Response) => {
  try {
    const deletedMessages = await horizon.message.deleteMany();
    res
      .status(200)
      .json({
        success: true,
        data: deletedMessages,
        message: "All messages deleted",
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

// delete all messages for a topic
export const deleteAllMessagesByTopicId = async (
  req: Request,
  res: Response
) => {
  try {
    const { topicId } = req.params;
    const deletedMessages = await horizon.message.deleteMany({
      where: {
        topicId: topicId,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: deletedMessages,
        message: "All messages for topic deleted",
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

// delete messages for a user
export const deleteMessagesByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const person = await horizon.person.findUnique({
      where: {
        id: userId,
      },
    });
    if (!person) {
      res
        .status(404)
        .json({ success: false, data: null, message: "User not found" })
        .end();
      return;
    }

    const deletedMessages = await horizon.message.deleteMany({
      where: {
        sender: userId,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: deletedMessages,
        message: "All messages for user deleted",
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

// delete message by id and for a user (controlling visiblity)
export const deleteMessageByMessageIdAndUserId = async (
  req: Request,
  res: Response
) => {
  try {
    const { messageId, personId } = req.params;
    const message = await horizon.message.findUnique({
      where: {
        id: messageId,
      },
    });
    if (!message) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Message not found" })
        .end();
      return;
    }

    if (message.sender !== personId) {
      res
        .status(403)
        .json({ success: false, data: null, message: "Forbidden" })
        .end();
      return;
    }

    const deletedMessage = await horizon.message.delete({
      where: {
        id: messageId,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        data: deletedMessage,
        message: "Message deleted",
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
