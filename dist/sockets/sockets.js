import { PrismaClient as HarbingerClient } from "/home/ali-abbas/Documents/learn/harbinger/prisma/generated/harbinger/index.js";
import { z } from "zod";
const harbinger = new HarbingerClient();
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
const createMessage = async (messageOb) => {
    try {
        const message = messageSchema.safeParse(messageOb);
        if (!message.success) {
            console.error(message.error);
            return;
        }
        const topic = await harbinger.topic.findUnique({
            where: {
                id: message.data.topicId,
            },
        });
        if (!topic) {
            console.error("Topic not found");
            return;
        }
        const newMessage = await harbinger.message.create({
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
        return newMessage;
    }
    catch (error) {
        console.error(error);
        return;
    }
};
export default function sockets(io, onlineUsers) {
    io.on("connect", (socket) => {
        console.log("A new user connected at socket:", socket.id);
        socket.on("register", (userID) => {
            onlineUsers[userID] = socket.id;
            console.log(`User with user id ${userID} mapped with socket id ${socket.id}`);
        });
        socket.on("new_message", async (message) => {
            console.log("New message received:", message);
            const senderSocketId = onlineUsers[message.sender];
            if (senderSocketId) {
                console.log("User is online, sending message to user");
                io.to(senderSocketId).emit("new_message", message);
            }
            else
                console.log("User is offline, message not sent. Now, saving...");
            try {
                await createMessage(message);
                console.log("Message saved to DB");
            }
            catch (err) {
                console.error("Error saving message:", err);
            }
        });
        socket.on("disconnect", () => {
            for (let uid in onlineUsers) {
                if (onlineUsers[uid] === socket.id) {
                    delete onlineUsers[uid];
                    console.log(`User with id ${uid} disconnected.`);
                    break;
                }
            }
        });
    });
}
//# sourceMappingURL=sockets.js.map