const { Message } = require('../models/Message');

module.exports.createMessage = async (req, res) => {
    try {
        const { chatId, topicId, sender, text, media } = req.body;
        const newMessage = new Message({ chat: chatId, topic: topicId, sender, text, media });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.getMessageById = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId)
            .populate('sender')
            .populate('chat')
            .populate('topic');
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.updateMessage = async (req, res) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.messageId,
            req.body,
            { new: true }
        );
        if (!updatedMessage) return res.status(404).json({ message: 'Message not found' });
        res.json(updatedMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.deleteMessage = async (req, res) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(req.params.messageId);
        if (!deletedMessage) return res.status(404).json({ message: 'Message not found' });
        res.json({ message: 'Message deleted successfully' });
    } catch (error)        {
        res.status(400).json({ error: error.message });
    }
};
