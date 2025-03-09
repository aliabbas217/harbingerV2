"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allRouter = void 0;
const express_1 = __importDefault(require("express"));
const userCRUD_js_1 = require("../../dbCrud/userCRUD.js");
const chatCRUD_js_1 = require("../../dbCrud/chatCRUD.js");
const topicCRUD_js_1 = require("../../dbCrud/topicCRUD.js");
const messageCRUD_js_1 = require("../../dbCrud/messageCRUD.js");
exports.allRouter = express_1.default.Router();
exports.allRouter.route("/users").get(userCRUD_js_1.getAllUsers).delete(userCRUD_js_1.deleteAllUsers);
exports.allRouter.route("/users/username").get(userCRUD_js_1.getAllUsername);
exports.allRouter.route("/chats").get(chatCRUD_js_1.getAllChats).delete(chatCRUD_js_1.deleteAllChats);
exports.allRouter.route("/topics").get(topicCRUD_js_1.getAllTopics).delete(topicCRUD_js_1.deleteAllTopics);
exports.allRouter.route("/messages").get(messageCRUD_js_1.getAllMessages).delete(messageCRUD_js_1.deleteAllMessages);
//# sourceMappingURL=allRoute.js.map