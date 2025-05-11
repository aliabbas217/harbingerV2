import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import sockets from "./sockets/sockets.js";
import { Socket } from "socket.io";

// v2 routes
import chatRouter from "./routes/v2/chatRouter.js";
import topicRouter from "./routes/v2/topicRouter.js";
import messageRouter from "./routes/v2/messageRouter.js";

const app = express();
export const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

app.use(express.json());
// Configure CORS with specific options
app.use(cors({
  origin: '*', // Allow all origins - you might want to restrict this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.static("public"));

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

export const onlineUsers: { [key: string]: Socket["id"] } = {};
sockets(io, onlineUsers);
