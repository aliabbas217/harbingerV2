const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!validator.isStrongPassword(password)) {
            return res.status(400).send('Password must meet strength requirements');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
};

// Login a user
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
};
