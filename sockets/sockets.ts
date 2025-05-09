import {
  PrismaClient as HorizonClient,
  MediaType,
  MessageStatus,
} from "../prisma/generated/horizon/index.js";
import { Server, Socket } from "socket.io";

const horizon = new HorizonClient();

interface NewMessagePayload {
  senderId: string;
  topicId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
}

export default function sockets(
  io: Server,
  onlineUsers: { [key: string]: Socket["id"] }
) {
  io.on("connect", (socket: Socket) => {
    console.log(`A new user connected: ${socket.id}`);

    socket.on("register", (userId: string) => {
      if (userId) {
        onlineUsers[userId] = socket.id;
        console.log(
          `User with userID ${userId} registered with socket ID ${socket.id}`
        );
        console.log("Current online users:", Object.keys(onlineUsers));
      } else {
        console.warn(
          `Attempt to register with undefined or null userId from socket ${socket.id}`
        );
      }
    });

    socket.on("send_message", async (payload: NewMessagePayload) => {
      console.log(
        `Event 'send_message' received from socket ${socket.id}:`,
        payload
      );

      try {
        if (
          !payload.senderId ||
          !payload.topicId ||
          (!payload.text && !payload.mediaUrl)
        ) {
          console.error("Invalid message payload for 'send_message':", payload);
          socket.emit("message_error", {
            error:
              "Invalid message payload. senderId, topicId, and text/mediaUrl are required.",
          });
          return;
        }

        const topic = await horizon.topic.findUnique({
          where: { id: payload.topicId },
          include: {
            chat: { select: { participants: true } },
          },
        });

        if (!topic) {
          console.error(`Topic not found: ${payload.topicId}`);
          socket.emit("message_error", { error: "Topic not found." });
          return;
        }

        const potentialReceivers: string[] = topic.chat.participants;

        if (!potentialReceivers.includes(payload.senderId)) {
          console.warn(
            `Sender ${payload.senderId} not authorized for topic ${payload.topicId}.`
          );
          socket.emit("message_error", {
            error: "You are not authorized to send messages to this topic.",
          });
          return;
        }

        const messageDataToSave = {
          sender: payload.senderId,
          topicId: payload.topicId,
          text: payload.text,
          mediaUrl: payload.mediaUrl,
          mediaType: payload.mediaType,
          status: MessageStatus.SENT,
          visibleTo: potentialReceivers,
        };

        const savedMessage = await horizon.message.create({
          data: messageDataToSave,
        });
        console.log(`Message saved to DB: ${savedMessage.id}`);

        potentialReceivers.forEach((receiverId) => {
          const receiverSocketId = onlineUsers[receiverId];
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive_message", savedMessage);
            console.log(
              `Event 'receive_message' for message ${savedMessage.id} emitted to online user ${receiverId} (socket ${receiverSocketId})`
            );
          } else {
            console.log(
              `User ${receiverId} is offline. Message ${savedMessage.id} saved.`
            );
          }
        });
      } catch (err) {
        console.error("Error processing 'send_message' on server:", err);
        socket.emit("message_error", {
          error: "Server error while processing your message.",
        });
      }
    });

    socket.on(
      "message_seen",
      async (data: { messageId: string; userId: string }) => {
        try {
          const updatedMessage = await horizon.message.updateMany({
            where: { id: data.messageId, NOT: { sender: data.userId } },
            data: { status: MessageStatus.SEEN },
          });

          if (updatedMessage.count > 0) {
            const msg = await horizon.message.findUnique({
              where: { id: data.messageId },
            });
            if (msg) {
              msg.visibleTo.forEach((uid) => {
                if (onlineUsers[uid] /* && uid !== data.userId */) {
                  io.to(onlineUsers[uid]).emit("message_status_updated", {
                    messageId: data.messageId,
                    status: MessageStatus.SEEN,
                    seenBy: data.userId,
                  });
                }
              });
            }
            console.log(
              `Message ${data.messageId} marked as SEEN by user ${data.userId}`
            );
          }
        } catch (error) {
          console.error("Error updating message to SEEN:", error);
        }
      }
    );

    socket.on("disconnect", () => {
      let disconnectedUserId: string | null = null;
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          disconnectedUserId = userId;
          break;
        }
      }
      if (disconnectedUserId) {
        console.log(
          `User with userID ${disconnectedUserId} (socket ${socket.id}) disconnected.`
        );
        console.log("Current online users:", Object.keys(onlineUsers));
      } else {
        console.log(
          `Socket ${socket.id} disconnected (was not registered with a userID).`
        );
      }
    });
  });
}
