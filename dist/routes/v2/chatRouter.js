import { Router } from "express";
import { createChat, getAllChats, getAllChatsByUserId, getChatByChatId, deleteChatsByUserId, deleteChatByChatId, deleteChatForOneUser, } from "../../controllers/chatController.js";
const chatRouter = Router();
chatRouter.route("/").get(getAllChats).post(createChat);
chatRouter.route("/:chatId").get(getChatByChatId).delete(deleteChatByChatId);
chatRouter
    .route("/user/:userId")
    .get(getAllChatsByUserId)
    .delete(deleteChatsByUserId);
chatRouter.route("/:chatId/user/:userId").delete(deleteChatForOneUser);
export default chatRouter;
//# sourceMappingURL=chatRouter.js.map