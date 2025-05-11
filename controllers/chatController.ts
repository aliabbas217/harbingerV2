import { Request, Response } from "express";
import { PrismaClient as HorizonClient } from '@prisma/client'
import { z } from "zod";

const horizon = new HorizonClient();

const createChatSchema = z.object({
  participants: z
    .array(z.string().min(1))
    .length(2, "A chat must have exactly two participants."),
});

export const createChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validationResult = createChatSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        errors: validationResult.error.flatten().fieldErrors,
        message: "Invalid data",
      });
      return;
    }

    const { participants } = validationResult.data;

    const usersExist = await horizon.person.count({
      where: { id: { in: participants } },
    });
    if (usersExist !== participants.length) {
      res
        .status(404)
        .json({
          success: false,
          message: "One or more participants not found.",
        });
      return;
    }

    const result = await horizon.$transaction(async (prisma) => {
      const newChat = await prisma.chat.create({
        data: {
          participants: participants,
          visibleTo: participants,
        },
      });

      await prisma.person.update({
        where: { id: participants[0] },
        data: { chats: { push: newChat.id } },
      });

      await prisma.person.update({
        where: { id: participants[1] },
        data: { chats: { push: newChat.id } },
      });

      return newChat;
    });

    res
      .status(201)
      .json({ success: true, data: result, message: "Chat created" });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chats = await horizon.chat.findMany();
    res
      .status(200)
      .json({ success: true, data: chats, message: "Chats found" });
  } catch (error) {
    console.error("Error getting all chats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllChatsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { personId } = req.params;
    const user = await horizon.person.findUnique({
      where: { id: personId },
      select: { chats: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.chats || user.chats.length === 0) {
      res
        .status(200)
        .json({ success: true, data: [], message: "User has no chats" });
      return;
    }

    const chats = await horizon.chat.findMany({
      where: {
        id: { in: user.chats },
      },
    });

    res
      .status(200)
      .json({ success: true, data: chats, message: "Chats found" });
  } catch (error) {
    console.error("Error getting chats by user ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getChatByChatId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const chat = await horizon.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }

    res.status(200).json({ success: true, data: chat, message: "Chat found" });
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteChatByChatId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;

    const result = await horizon.$transaction(async (prisma) => {
      const chatToDelete = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { participants: true },
      });

      if (!chatToDelete) {
        throw new Error("ChatNotFound");
      }

      const deletedChat = await prisma.chat.delete({
        where: { id: chatId },
      });

      if (chatToDelete.participants && chatToDelete.participants.length > 0) {
        for (const personId of chatToDelete.participants) {
          const person = await prisma.person.findUnique({
            where: { id: personId },
            select: { chats: true },
          });
          if (person && person.chats.includes(chatId)) {
            await prisma.person.update({
              where: { id: personId },
              data: { chats: person.chats.filter((cId) => cId !== chatId) },
            });
          }
        }
      }
      return deletedChat;
    });

    res
      .status(200)
      .json({
        success: true,
        data: result,
        message: "Chat deleted successfully",
      });
  } catch (error: any) {
    console.error("Error deleting chat by ID:", error);
    if (error.message === "ChatNotFound") {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteChatsByUserId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { personId } = req.params;

    const user = await horizon.person.findUnique({
      where: { id: personId },
      select: { chats: true, id: true },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.chats || user.chats.length === 0) {
      res
        .status(200)
        .json({
          success: true,
          data: [],
          message: "User has no chats to leave.",
        });
      return;
    }

    const chatIdsToProcess = [...user.chats];
    let updatedChatsCount = 0;
    let deletedChatsCount = 0;

    for (const chatId of chatIdsToProcess) {
      await horizon.$transaction(async (prisma) => {
        const chat = await prisma.chat.findUnique({
          where: { id: chatId },
        });

        if (!chat) return;

        const updatedParticipants = chat.participants.filter(
          (p) => p !== personId
        );
        const updatedVisibleTo = chat.visibleTo.filter((v) => v !== personId);

        const currentPerson = await prisma.person.findUnique({
          where: { id: personId },
          select: { chats: true },
        });
        if (currentPerson) {
          await prisma.person.update({
            where: { id: personId },
            data: { chats: currentPerson.chats.filter((c) => c !== chatId) },
          });
        }

        if (updatedParticipants.length === 0) {
          await prisma.chat.delete({ where: { id: chatId } });
          deletedChatsCount++;
        } else {
          await prisma.chat.update({
            where: { id: chatId },
            data: {
              participants: updatedParticipants,
              visibleTo: updatedVisibleTo,
            },
          });
          updatedChatsCount++;
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${personId} processed for ${chatIdsToProcess.length} chats. ${updatedChatsCount} chats updated, ${deletedChatsCount} chats deleted.`,
    });
  } catch (error) {
    console.error("Error in deleteChatsByUserId:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteChatForOneUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { chatId, personId } = req.params;

    const result = await horizon.$transaction(async (prisma) => {
      const user = await prisma.person.findUnique({
        where: { id: personId },
        select: { chats: true },
      });

      if (!user) throw new Error("UserNotFound");

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) throw new Error("ChatNotFound");

      const updatedUserChats = user.chats.filter((cId) => cId !== chatId);
      await prisma.person.update({
        where: { id: personId },
        data: { chats: updatedUserChats },
      });

      const updatedParticipants = chat.participants.filter(
        (p) => p !== personId
      );
      const updatedVisibleTo = chat.visibleTo.filter((v) => v !== personId);

      if (updatedParticipants.length === 0) {
        await prisma.chat.delete({ where: { id: chatId } });
        return { action: "deleted", chatData: null };
      } else {
        const updatedChat = await prisma.chat.update({
          where: { id: chatId },
          data: {
            participants: updatedParticipants,
            visibleTo: updatedVisibleTo,
          },
        });
        return { action: "updated", chatData: updatedChat };
      }
    });

    if (result.action === "deleted") {
      res
        .status(200)
        .json({
          success: true,
          message: "Chat removed for user and deleted as it became empty.",
        });
    } else {
      res
        .status(200)
        .json({
          success: true,
          data: result.chatData,
          message: "Chat removed for user.",
        });
    }
  } catch (error: any) {
    console.error("Error in deleteChatForOneUser:", error);
    if (error.message === "UserNotFound") {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    if (error.message === "ChatNotFound") {
      res.status(404).json({ success: false, message: "Chat not found" });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
