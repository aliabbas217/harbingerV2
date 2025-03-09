import express from "express";
import {
  getUserByUsername,
  createUserByUsername,
  deleteUserByUsername,
} from "../../dbCrud/userCRUD.js";

export const userRouter = express.Router();

userRouter
  .route("/:username")
  .get(getUserByUsername)
  .post(createUserByUsername)
  .delete(deleteUserByUsername);
