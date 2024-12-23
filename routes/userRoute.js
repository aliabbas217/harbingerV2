import express from "express";
import {
  getUserByEmail,
  createUserByEmail,
  deleteUserByEmail,
} from "../dbCrud/userCRUD.js";

export const userRouter = express.Router();

userRouter
  .route("/:email")
  .get(getUserByEmail)
  .post(createUserByEmail)
  .delete(deleteUserByEmail);
