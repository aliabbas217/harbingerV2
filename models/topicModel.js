const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    topicName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dateCreated: { type: Date, default: Date.now },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

module.exports.Topic = mongoose.model('Topic', TopicSchema);
