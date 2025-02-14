import { Message } from "../models/messageModel.js";

export default function sockets(io, onlineUsers) {
  io.on("connect", (socket) => {
    console.log("A new user connected at socket:", socket.id);

    socket.on("register", (userID) => {
      onlineUsers[userID] = socket.id;
      console.log(
        `User with user id ${userID} mapped with socket id ${socket.id}`
      );
    });

    socket.on("new_message", async (message) => {
      console.log("New message received:", message);

      try {
        await Message.create(message);
        console.log("Message saved to DB");
      } catch (err) {
        console.error("Error saving message:", err);
      }

      const senderSocketId = onlineUsers[message.sender];
      if (senderSocketId) {
        io.to(senderSocketId).emit("new_message", message);
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
