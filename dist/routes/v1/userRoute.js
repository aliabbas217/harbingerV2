"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const userCRUD_js_1 = require("../../dbCrud/userCRUD.js");
exports.userRouter = express_1.default.Router();
exports.userRouter
    .route("/:username")
    .get(userCRUD_js_1.getUserByUsername)
    .post(userCRUD_js_1.createUserByUsername)
    .delete(userCRUD_js_1.deleteUserByUsername);
//# sourceMappingURL=userRoute.js.map