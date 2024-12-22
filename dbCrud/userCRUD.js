import { User } from "../models/userModel.js";

import { createMessage } from "./messageCRUD.js";
import { createChatBySenderID } from "./chatCRUD.js";
import { createTopicWIthChatID, deleteTopicByUserEmail } from "./topicCRUD.js";
import { Topic } from "../models/topicModel.js";

export const createUserByEmail = async (email) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, data: "User already exists" };
    }
    const messageResponse = await createMessage({
      sender: email,
      text: "Hello! You can use this for general discussion.",
    });
    if (!messageResponse.success) {
      return {
        success: false,
        data: `Message creation failed: ${messageResponse.data}`,
      };
    }

    const newMessageId = messageResponse.data._id;

    const topicResponse = new Topic({
      createdBy: email,
      messages: [newMessageId],
      visibleTo: [email],
    });

    await topicResponse.save();

    const newTopicId = topicResponse.data._id;

    const chatResponse = new Chat({
      participants: [email],
      topics: [newTopicId],
    });

    await chatResponse.save();

    const newChatId = chatResponse.data._id;

    const newUser = new User({ email, chats: [newChatId] });
    await newUser.save();

    return { success: true, data: newUser };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const updateUserByEmail = async (email, updateData) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      updateData,
      { new: true }
    );
    if (!updatedUser) {
      return { success: false, data: "User not found" };
    }
    return { success: true, data: updatedUser };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getUsers = async (filter) => {
  try {
    const users = await User.find(filter);
    return { success: true, data: users };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email });
    if (!user) return { success: false, data: "User not found" };
    await user.populate({
      path: "chats",
      populate: {
        path: "topics",
        populate: {
          path: "messages",
        },
      },
    });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, data: error.message };
  }
};

export const deleteUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return { success: false, data: "User not found" };
    const userID = user._id;
    for (const chatID of user.chats) {
      const chat = await Chat.findById(chatID);
      if (chat) {
        const participantIndex = chat.participants.indexOf(email);
        if (participantIndex !== -1) {
          chat.participants.splice(participantIndex, 1);
          if (chat.participants.length === 0) {
            for (const topicID of chat.topics) {
              const topic = await Topic.findById(topicID);
              if (topic) {
                await Promise.all(
                  topic.messages.map((messageID) =>
                    Message.findByIdAndDelete(messageID)
                  )
                );
                await topic.deleteOne();
              }
            }
            await chat.deleteOne();
          } else {
            await chat.save();
          }
        }
      }
    }
    const topics = await Topic.find({ visibelTo: email });
    for (const topic of topics) {
      const userIndex = topic.visibelTo.indexOf(email);
      if (userIndex !== -1) {
        topic.visibelTo.splice(userIndex, 1);
        if (topic.visibelTo.length === 0) {
          await Promise.all(
            topic.messages.map((messageID) =>
              Message.findByIdAndDelete(messageID)
            )
          );
          await topic.deleteOne();
        } else {
          await topic.save();
        }
      }
    }
    await User.findByIdAndDelete(userID);
    return {
      success: true,
      data: "User and related data deleted successfully",
    };
  } catch (error) {
    return { success: false, data: error.message };
  }
};
