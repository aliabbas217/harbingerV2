const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const io = require('../app').io;  // Import socket instance

// Fetch previous chats for a user
exports.getChats = async (req, res) => {
    try {
        const { username } = req.user;
        const user = await User.findOne({ username }).populate({
            path: 'chats',
            populate: { path: 'messages' }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.json(user.chats);
    } catch (error) {
        res.status(500).send('Error fetching chats');
    }
};

// Handle sending a message
exports.sendMessage = async (req, res) => {
    try {
        const { from, to, text } = req.body;

        // Create message object
        const message = { from, to, text, timestamp: Date.now() };

        // Emit the message first for quick delivery
        const recipientSocket = io.sockets.sockets.get(to);
        if (recipientSocket) {
            // If the recipient is online, emit the message
            io.to(recipientSocket.id).emit('chatMessage', message);
        }

        // Proceed with the database operation asynchronously
        setImmediate(async () => {
            // Check if a chat already exists between the two users
            let chat = await Chat.findOne({ participants: { $all: [from, to] } });

            if (!chat) {
                // If no chat exists, create a new one
                chat = new Chat({
                    participants: [from, to],
                    messages: []
                });

                await chat.save();

                // Add the chat ID to both users
                await User.updateMany(
                    { _id: { $in: [from, to] } },
                    { $push: { chats: chat._id } }
                );
            }

            // Save the message in the chat
            chat.messages.push(message);
            await chat.save();
        });

        res.status(201).send('Message emitted and queued for saving.');
    } catch (error) {
        res.status(500).send('Error sending message');
    }
};