import express from "express";
import {
  getTopicByID,
  getTopicsByChatID,
  deleteTopicByTopicID,
  deleteTopicsByChatID,
  deleteTopicByUserEmail,
  createTopicByChatID,
  updateTopicByTopicID,
} from "../dbCrud/topicCRUD.js";

export const topicsRouter = express.Router();
topicsRouter.route("/:topicID").get(getTopicByID).put(updateTopicByTopicID);
topicsRouter
  .route("/chat/:chatID")
  .get(getTopicsByChatID)
  .post(createTopicByChatID)
  .delete(deleteTopicsByChatID);
topicsRouter.route("/:topicID/chat/:chatID").delete(deleteTopicByTopicID);
topicsRouter.route("/:topicID/user/:email").delete(deleteTopicByUserEmail);
