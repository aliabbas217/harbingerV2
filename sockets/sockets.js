const { io, onlineUsers } = require('../app');


io.on('connect', (socket)=>{
    console.log('A new user connected at socket: ', socket.id);

    // on client side when a user will connect we will emit an event with the userID(email)
    socket.on('register', (userID)=>{
        onlineUsers[userID] = socket.id;
        console.log(`User with user id ${userID} mapped with socket id ${socket.id}`);
    });

    socket.on('new_message', ()=>{
        
    })

    // handeling disconnections
    socket.on('disconnect', ()=>{
        for (let uid in onlineUsers){
            if(onlineUsers[uid] === socket.id){
                delete onlineUsers[uid];
                console.log(`User with id ${uid}, disconnected.`)
            }
        }
    });
});
