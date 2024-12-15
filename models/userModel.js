const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
});

module.exports.User = mongoose.model('User', UserSchema);