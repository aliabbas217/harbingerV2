const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    media: { url: String, mediaType: { type: String, enum: ['jpg', 'png', 'pdf', 'gif', 'other'], default: 'other' } },
    status: { type: String, enum: ['sent', 'delivered', 'seen', 'error', 'sending'], default: 'sending' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    timestamp: { type: Date, default: Date.now },
});


module.exports.Message = mongoose.model('Message', MessageSchema);
