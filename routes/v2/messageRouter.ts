import { Router } from "express";

import {
  createMessage,
  updateMessageById,
  getAllMessages,
  getAllMessagesByTopicId,
  getMessageById,
  deleteAllMessages,
  deleteAllMessagesByTopicId,
  deleteMessageById,
  deleteMessageByMessageIdAndUserId,
  deleteMessagesByUserId,
} from "../../controllers/messageController.js";

const messageRouter = Router();

messageRouter
  .route("/")
  .get(getAllMessages)
  .post(createMessage)
  .delete(deleteAllMessages);
messageRouter
  .route("/:messageId")
  .get(getMessageById)
  .delete(deleteMessageById)
  .patch(updateMessageById);
messageRouter
  .route("/topic/:topicId")
  .get(getAllMessagesByTopicId)
  .delete(deleteAllMessagesByTopicId);
messageRouter.route("/person/:personId").get(deleteMessagesByUserId);
messageRouter
  .route("/:messageId/person/:personId")
  .delete(deleteMessageByMessageIdAndUserId);

export default messageRouter;
