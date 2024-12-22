import express from "express";

export const allRouter = express.Router();
allRouter.route("/users").get().delete();

allRouter.route("/chats").get().delete();

allRouter.route("/topics").get().delete();

allRouter.route("/messages").get().delete();
