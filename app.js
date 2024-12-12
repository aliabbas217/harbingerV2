const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const redis = require('redis');
const { createAdapter } = require('socket.io-redis');

const chatRoutes = require('./routes/chats');
const userRoutes = require('./routes/users');
const Chat = require('./models/chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Redis connection
const redisClient = redis.createClient();
const redisPublisher = redisClient.duplicate();
io.adapter(createAdapter(redisClient, redisPublisher));

module.exports.io = io;

app.use(express.json());
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB');
});

// Routes
app.use('/chats', chatRoutes);
app.use('/users', userRoutes);


// Socket.io events
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('chatMessage', async (msg) => {
        const { from, to, text } = msg;

        let chat = await Chat.findOne({ participants: { $all: [from, to] } });

        if (!chat) {
            chat = new Chat({ participants: [from, to] });
            await chat.save();
        }

        const message = { from, to, text, timestamp: Date.now() };

        const recipientSocket = io.sockets.sockets.get(to);
        if (recipientSocket) {
            io.to(recipientSocket.id).emit('chatMessage', message);
        } 

        chat.messages.push(message);
        await chat.save();
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});