import express from "express";

export const messagesRouter = express.Router();
messagesRouter.route("/:topicID").get().post();
messagesRouter.route("/:messageID").delete();
