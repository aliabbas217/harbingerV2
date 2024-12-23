import express from "express";
import {
  createChatByUserID,
  getAllChatsByUserID,
  deleteAllChatsByUserID,
  deleteChatByUserID,
} from "../dbCrud/chatCRUD.js";

export const chatsRouter = express.Router();
chatsRouter
  .route("/user/:userID")
  .get(getAllChatsByUserID)
  .post(createChatByUserID)
  .delete(deleteAllChatsByUserID);
chatsRouter.route("/:chatID/user/:userID").delete(deleteChatByUserID);
