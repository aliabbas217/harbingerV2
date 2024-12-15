const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastUpdated: { type: Date, default: Date.now },
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    typingIndication: {
        type: Boolean,
        default: false
    },
});

module.exports.Chat = mongoose.model('Chat', ChatSchema);