const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);

const onlineUsers = {};

module.exports.onlineUsers = onlineUsers;
module.exports.io = io; //it will be used in ./sockets for better modularity and to keep the code clean

app.use(express.json());
app.use(express.static('public')); // no reason to use this pr acha lag rha tha
app.use(cors()); // cors da te pta a tenu comment q add kr rya a
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy');
});

mongoose.connect(process.env.MONGO_URI).then(
    ()=>{
        console.log(`Connected to MongoDB-${process.env.ENVIRONMENT}`);
    }
).catch(
    (error)=>{
        console.log('Error Connecting to MongoDB:', error);
    }
);

const port = process.env.PORT || 3000;
httpServer.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});

const shutDown = () => {
    console.log('\nShutting down server...');
    mongoose.connection.close().then(()=>{
        console.log("Connection with MongoDB closed")
    }).catch((error)=>{console.log(`Error occoured while closing connection with Mongo:${error}`)});
    httpServer.close(()=>{
        console.log('Server dumped')
    });
};

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

require('./sockets');