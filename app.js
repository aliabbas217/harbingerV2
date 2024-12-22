import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import sockets from "./sockets/sockets.js";

import { chatsRouter } from "./routes/chatsRoute.js";
import { topicsRouter } from "./routes/topicsRoute.js";
import { messagesRouter } from "./routes/messagesRoute.js";
import { userRouter } from "./routes/userRoute.js";
import { allRouter } from "./routes/allRoute.js";

const app = express();
export const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

const api = "/harbinger/api/v1";
app.use(`${api}/chat`, chatsRouter);
app.use(`${api}/topic`, topicsRouter);
app.use(`${api}/message`, messagesRouter);
app.use(`${api}/user`, userRouter);
app.use(`${api}/all`, allRouter);
app.get("/health", (req, res) => {
  res.status(200).json({ res: "Server is healthy" });
});

export const onlineUsers = {};
sockets(io, onlineUsers);
