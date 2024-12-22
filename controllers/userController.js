import {
  createUserByEmail,
  deleteUserByEmail,
  getUserByEmail,
  getUsers,
} from "../dbCrud/userCRUD.js";

export const postUser = async (req, res) => {
  try {
    const email = req.body.email;
    const userResponse = await createUserByEmail(email);
    if (!userResponse.success) {
      return res.status(400).json({
        success: false,
        data: `User creation failed: ${userResponse.data}`,
      });
    }
    res.status(201).json({ success: true, data: userResponse.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const response = await getUsers({});
    if (!response.success) {
      return res.status(400).json({ success: false, data: response.error });
    }
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const email = req.body.email;
    const response = await getUserByEmail(email);
    if (!response.success) {
      return res.status(404).json({ success: false, data: "User not found" });
    }

    const user = response.data;
    await user.populate({
      path: "chats",
      populate: {
        path: "topics",
      },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, data: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const email = req.body.email;
    const response = await deleteUserByEmail(email);
    if (!response.success) {
      return res.status(404).json({ success: false, data: "User not found 5" });
    }
    res.json({ success: true, data: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: true, data: error.message });
  }
};
