import express from "express";

export const chatsRouter = express.Router();
chatsRouter.route("/").post();
chatsRouter
  .route("/:senderID") //get all the chats of a user
  .get()
  .post();
chatsRouter.route("/:senderEmail/:chatID").delete();
chatsRouter.route("/:chatID").delete();
