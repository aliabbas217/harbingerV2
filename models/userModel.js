const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true, minlength: 3 },
    password: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                return validator.isStrongPassword(v, {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1
                });
            },
            message: props => `${props.value} is not a strong enough password!`
        }
    },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
});

module.exports = mongoose.model('User', UserSchema);