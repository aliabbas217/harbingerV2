import express from "express";

export const topicsRouter = express.Router();
topicsRouter.route("/:topicID").get().delete();
topicsRouter.route("/:chatID").get().post();
