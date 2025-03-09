import { Router } from "express";
import {
  createChat,
  getAllChats,
  getAllChatsByUserId,
  getChatByChatId,
  deleteChatsByUserId,
  deleteChatByChatId,
  deleteChatForOneUser,
} from "../../controllers/chatController.js";

const chatRouter = Router();

chatRouter.route("/").get(getAllChats).post(createChat);
chatRouter.route("/:chatId").get(getChatByChatId).delete(deleteChatByChatId);
chatRouter
  .route("/person/:personId")
  .get(getAllChatsByUserId)
  .delete(deleteChatsByUserId);
chatRouter.route("/:chatId/person/:personId").delete(deleteChatForOneUser);

export default chatRouter;
