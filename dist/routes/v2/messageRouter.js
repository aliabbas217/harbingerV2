import { Router } from "express";
import { createMessage, updateMessageById, getAllMessages, getAllMessagesByTopicId, getMessageById, deleteAllMessages, deleteAllMessagesByTopicId, deleteMessageById, deleteMessageByMessageIdAndUserId, deleteMessagesByUserId, } from "../../controllers/messageController.js";
const messageRouter = Router();
messageRouter
    .route("/")
    .get(getAllMessages)
    .post(createMessage)
    .delete(deleteAllMessages);
messageRouter
    .route("/:messageId")
    .get(getMessageById)
    .delete(deleteMessageById);
messageRouter
    .route("/topic/:topicId")
    .get(getAllMessagesByTopicId)
    .delete(deleteAllMessagesByTopicId);
messageRouter.route("/user/:userId").get(deleteMessagesByUserId);
messageRouter
    .route("/:messageId/user/:userId")
    .delete(deleteMessageByMessageIdAndUserId);
messageRouter.route("/:messageId").patch(updateMessageById);
export default messageRouter;
//# sourceMappingURL=messageRouter.js.map