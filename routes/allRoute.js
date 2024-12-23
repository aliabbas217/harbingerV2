import express from "express";
import { getAllUsers, deleteAllUsers } from "../dbCrud/userCRUD.js";
import { getAllChats, deleteAllChats } from "../dbCrud/chatCRUD.js";
import { getAllTopics, deleteAllTopics } from "../dbCrud/topicCRUD.js";
import { getAllMessages, deleteAllMessages } from "../dbCrud/messageCRUD.js";
export const allRouter = express.Router();
allRouter.route("/users").get(getAllUsers).delete(deleteAllUsers);

allRouter.route("/chats").get(getAllChats).delete(deleteAllChats);

allRouter.route("/topics").get(getAllTopics).delete(deleteAllTopics);

allRouter.route("/messages").get(getAllMessages).delete(deleteAllMessages);
