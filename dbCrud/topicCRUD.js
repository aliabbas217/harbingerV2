const { Topic } = require('../models/Topic');

module.exports.createTopic = async (req, res) => {
    try {
        const { chatId, topicName, createdBy } = req.body;
        const newTopic = new Topic({ chat: chatId, topicName, createdBy });
        await newTopic.save();
        res.status(201).json(newTopic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.getTopicById = async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.topicId)
            .populate('chat')
            .populate('createdBy')
            .populate('messages');
        if (!topic) return res.status(404).json({ message: 'Topic not found' });
        res.json(topic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.updateTopic = async (req, res) => {
    try {
        const updatedTopic = await Topic.findByIdAndUpdate(
            req.params.topicId,
            req.body,
            { new: true }
        );
        if (!updatedTopic) return res.status(404).json({ message: 'Topic not found' });
        res.json(updatedTopic);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports.deleteTopic = async (req, res) => {
    try {
        const deletedTopic = await Topic.findByIdAndDelete(req.params.topicId);
        if (!deletedTopic) return res.status(404).json({ message: 'Topic not found' });
        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
