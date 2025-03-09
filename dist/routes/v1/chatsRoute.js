"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatsRouter = void 0;
const express_1 = __importDefault(require("express"));
const chatCRUD_js_1 = require("../../dbCrud/chatCRUD.js");
exports.chatsRouter = express_1.default.Router();
exports.chatsRouter
    .route("/user/:username")
    .get(chatCRUD_js_1.getAllChatsByUsername)
    .post(chatCRUD_js_1.createChatByUsername)
    .delete(chatCRUD_js_1.deleteAllChatsByUsername);
exports.chatsRouter.route("/:chatID/user/:username").delete(chatCRUD_js_1.deleteChatByUsername);
//# sourceMappingURL=chatsRoute.js.map