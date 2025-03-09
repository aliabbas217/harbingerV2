import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import sockets from "./sockets/sockets.js";
// v2 routes
import chatRouter from "./routes/v2/chatRouter.js";
import topicRouter from "./routes/v2/topicRouter.js";
import messageRouter from "./routes/v2/messageRouter.js";
const app = express();
export const httpServer = http.createServer(app);
const io = new Server(httpServer);
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
const apiV2 = "/harbinger/api/v2";
app.use(`${apiV2}/chat`, chatRouter);
app.use(`${apiV2}/topic`, topicRouter);
app.use(`${apiV2}/message`, messageRouter);
app.get(`${apiV2}/health`, (req, res) => {
    res
        .status(200)
        .json({
        success: true,
        data: null,
        message: "Server is healthy and running.",
    })
        .end();
});
export const onlineUsers = {};
sockets(io, onlineUsers);
//# sourceMappingURL=app.js.map