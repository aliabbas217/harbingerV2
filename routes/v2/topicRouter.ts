import { Router } from "express";

import {
  createTopic,
  getAllTopics,
  getTopicByTopicId,
  getTopicsByChatId,
  deleteTopicByTopicId,
  deleteTopicByTopicIdAndUserId,
} from "../../controllers/topicController.js";

const topicRouter = Router();

topicRouter.route("/").get(getAllTopics).post(createTopic);
topicRouter
  .route("/:topicId")
  .get(getTopicByTopicId)
  .delete(deleteTopicByTopicId);
topicRouter.route("/chat/:chatId").get(getTopicsByChatId);
topicRouter
  .route("/:topicId/person/:personId")
  .delete(deleteTopicByTopicIdAndUserId);

export default topicRouter;
