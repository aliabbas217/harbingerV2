import express from "express";
import {
  postUser,
  deleteUser,
  getUser,
} from "../controllers/userController.js";
export const userRouter = express.Router();

userRouter.route("/").get(getUser).post(postUser).delete(deleteUser);
