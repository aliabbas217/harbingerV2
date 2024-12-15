const { Chat } = require('../models/Chat');

module.exports.createChat = async (req, res) => {
    try {
        const { participants, topics } = req.body;
        const newChat = new Chat({ participants, topics });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('participants')
            .populate('topics');
        if (!chat) return res.status(404).json({ message: 'Chat not found' });
        res.json(chat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.updateChat = async (req, res) => {
    try {
        const updatedChat = await Chat.findByIdAndUpdate(
            req.params.chatId,
            req.body,
            { new: true }
        );
        if (!updatedChat) return res.status(404).json({ message: 'Chat not found' });
        res.json(updatedChat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.deleteChat = async (req, res) => {
    try {
        const deletedChat = await Chat.findByIdAndDelete(req.params.chatId);
        if (!deletedChat) return res.status(404).json({ message: 'Chat not found' });
        res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
