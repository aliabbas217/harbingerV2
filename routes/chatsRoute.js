import express from "express";
import {
  createChatByUsername,
  getAllChatsByUsername,
  deleteAllChatsByUsername,
  deleteChatByUsername,
} from "../dbCrud/chatCRUD.js";

export const chatsRouter = express.Router();
chatsRouter
  .route("/user/:username")
  .get(getAllChatsByUsername)
  .post(createChatByUsername)
  .delete(deleteAllChatsByUsername);
chatsRouter.route("/:chatID/user/:username").delete(deleteChatByUsername);
