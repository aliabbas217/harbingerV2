"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicsRouter = void 0;
const express_1 = __importDefault(require("express"));
const topicCRUD_js_1 = require("../../dbCrud/topicCRUD.js");
exports.topicsRouter = express_1.default.Router();
exports.topicsRouter.route("/:topicID").get(topicCRUD_js_1.getTopicByID).put(topicCRUD_js_1.updateTopicByTopicID);
exports.topicsRouter
    .route("/chat/:chatID")
    .get(topicCRUD_js_1.getTopicsByChatID)
    .post(topicCRUD_js_1.createTopicByChatID)
    .delete(topicCRUD_js_1.deleteTopicsByChatID);
exports.topicsRouter.route("/:topicID/chat/:chatID").delete(topicCRUD_js_1.deleteTopicByTopicID);
exports.topicsRouter.route("/:topicID/user/:username").delete(topicCRUD_js_1.deleteTopicByUsername);
//# sourceMappingURL=topicsRoute.js.map