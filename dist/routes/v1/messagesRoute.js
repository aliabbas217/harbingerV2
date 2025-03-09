"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRouter = void 0;
const express_1 = __importDefault(require("express"));
const messageCRUD_js_1 = require("../../dbCrud/messageCRUD.js");
exports.messagesRouter = express_1.default.Router();
exports.messagesRouter
    .route("/topic/:topicID")
    .get(messageCRUD_js_1.getMessagesByTopicID)
    .post(messageCRUD_js_1.createMessageByTopicID)
    .delete(messageCRUD_js_1.deleteMessagesByTopicID);
exports.messagesRouter
    .route("/:messageID")
    .delete(messageCRUD_js_1.deleteMessageByID)
    .put(messageCRUD_js_1.updateMessageByID);
//# sourceMappingURL=messagesRoute.js.map