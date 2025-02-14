import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Topic } from "../models/topicModel.js";
import { Message } from "../models/messageModel.js";
export const createUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email format" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "User already exists" });
    }
    const message = new Message({
      sender: email,
      text: "Hello, Welcome to Harbinger.",
    });
    await message.save();
    const topic = new Topic({
      createdBy: email,
      visibleTo: [email],
      messages: [message._id],
    });
    await topic.save();
    const chat = new Chat({
      participants: [email],
      topics: [topic._id],
    });
    await chat.save();
    const newUser = new User({
      email,
      chats: [chat._id],
    });
    await newUser.save();
    return res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User does not exist" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Users do not exist" });
    }
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllEmail = async (req, res) => {
  try {
    const userEmails = await User.find({}, "email");
    if (userEmails.length === 0) {
      return res.status(404).json({ success: false, error: "No Users found" });
    }
    return res.status(200).json({ success: true, data: userEmails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User does not exist" });
    }
    await user.deleteOne();
    return res
      .status(200)
      .json({ success: true, data: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({});
    return res
      .status(200)
      .json({ success: true, data: "Users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};
