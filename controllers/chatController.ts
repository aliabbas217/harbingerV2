import { Request, Response } from "express";
import { PrismaClient as HarbingerClient } from "/home/ali-abbas/Documents/learn/harbinger/prisma/generated/harbinger/index.js";
import { PrismaClient as HorizonClient } from "/home/ali-abbas/Documents/learn/harbinger/prisma/generated/horizon/index.js";

import { z } from "zod";

const harbinger = new HarbingerClient();
const horizon = new HorizonClient();

/*
model Chat {
    id           String   @id @default(auto()) @map("_id") @db.ObjectId
    participants String[]
    topics       Topic[]  @relation("ChatTopics")
    visibleTo    String[]
  }

model Person {
  id              String         @id @default(auto()) @map("_id") @db.ObjectId
  username        String         @unique
  email           String         @unique
  profilePicture  String?
  status          UserStatus     @default(ACTIVE)
  lastLogin       DateTime?
  isActive        Boolean        @default(false)
  accountType     AccountType
  createdAt       DateTime       @default(now())
  chats           String[]       @db.ObjectId
  blocked         Boolean        @default(false)
  verified        Boolean        @default(false)
}
*/

// Chat Schema
const chatSchema = z.object({
  participants: z.array(z.string()).min(1).max(2),
  topics: z.array(z.string()).optional(),
  visibleTo: z.array(z.string()).optional(),
});

// Create a new chat

export const createChat = async (req: Request, res: Response) => {
  try {
    const validatedData = chatSchema.safeParse(req.body);
    if (!validatedData.success) {
      res
        .status(400)
        .json({
          success: false,
          data: validatedData.error,
          message: "Invalid data",
        })
        .end();
      return;
    }
    const chat = await harbinger.chat.create({
      data: {
        participants: validatedData.data.participants,
        visibleTo: validatedData.data.participants,
      },
    });

    await horizon.person.update({
      where: {
        id: validatedData.data.participants[0],
      },
      data: {
        chats: {
          push: chat.id,
        },
      },
    });

    await horizon.person.update({
      where: {
        id: validatedData.data.participants[1],
      },
      data: {
        chats: {
          push: chat.id,
        },
      },
    });

    res
      .status(201)
      .json({ success: true, data: chat, message: "Chat created" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Get all chats
export const getAllChats = async (req: Request, res: Response) => {
  try {
    const chats = await harbinger.chat.findMany();
    res
      .status(200)
      .json({ success: true, data: chats, message: "Chats found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Get all chats for a user
export const getAllChatsByUserId = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;
    const user = await horizon.person.findUnique({
      where: {
        id: personId,
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ success: false, data: null, message: "User not found" })
        .end();
      return;
    }

    const chats = await harbinger.chat.findMany({
      where: {
        id: {
          in: user.chats,
        },
      },
    });

    res
      .status(200)
      .json({ success: true, data: chats, message: "Chats found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Get chat by id
export const getChatByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await harbinger.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Chat not found" })
        .end();
      return;
    }

    res
      .status(200)
      .json({ success: true, data: chat, message: "Chat found" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Delete Chat by chat id
export const deleteChatByChatId = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const chat = await harbinger.chat.delete({
      where: {
        id: chatId,
      },
    });

    res
      .status(200)
      .json({ success: true, data: chat, message: "Chat deleted" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// Delete Chats by user id
export const deleteChatsByUserId = async (req: Request, res: Response) => {
  try {
    const { personId } = req.params;
    const user = await horizon.person.findUnique({
      where: {
        id: personId,
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ success: false, data: null, message: "User not found" })
        .end();
      return;
    }

    const chats = await harbinger.chat.findMany({
      where: {
        id: {
          in: user.chats,
        },
      },
    });

    await harbinger.chat.deleteMany({
      where: {
        id: {
          in: user.chats,
        },
      },
    });

    await horizon.person.update({
      where: {
        id: personId,
      },
      data: {
        chats: {
          set: [],
        },
      },
    });

    res
      .status(200)
      .json({ success: true, data: chats, message: "Chats deleted" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};

// delete chat for one user
export const deleteChatForOneUser = async (req: Request, res: Response) => {
  try {
    const { chatId, personId } = req.params;
    const user = await horizon.person.findUnique({
      where: {
        id: personId,
      },
    });

    if (!user) {
      res
        .status(404)
        .json({ success: false, data: null, message: "User not found" })
        .end();
      return;
    }

    const chat = await harbinger.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      res
        .status(404)
        .json({ success: false, data: null, message: "Chat not found" })
        .end();
      return;
    }

    await horizon.person.update({
      where: {
        id: personId,
      },
      data: {
        chats: {
          set: user.chats.filter((chat) => chat !== chatId),
        },
      },
    });

    chat.visibleTo.filter((id) => id != personId);

    if (chat.visibleTo.length === 0) {
      await harbinger.chat.delete({
        where: {
          id: chat.id,
        },
      });
    } else {
      await harbinger.chat.update({
        where: {
          id: chatId,
        },
        data: {
          participants: chat.participants,
          visibleTo: chat.visibleTo,
        },
      });
    }

    res
      .status(200)
      .json({ success: true, data: chat, message: "Chat deleted" })
      .end();
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, data: null, message: "Internal server error" })
      .end();
  }
};
