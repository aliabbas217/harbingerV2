import express from "express";
import {
  getMessagesByTopicID,
  createMessageByTopicID,
  deleteMessagesByTopicID,
  deleteMessageByID,
  updateMessageByID,
} from "../dbCrud/messageCRUD.js";
export const messagesRouter = express.Router();
messagesRouter
  .route("/topic/:topicID")
  .get(getMessagesByTopicID)
  .post(createMessageByTopicID)
  .delete(deleteMessagesByTopicID);
messagesRouter
  .route("/:messageID")
  .delete(deleteMessageByID)
  .put(updateMessageByID);
