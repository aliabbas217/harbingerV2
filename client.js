const io = require("socket.io-client");

// Connect to your server's Socket.IO endpoint
const socket = io("http://localhost:3000", {
    auth: {
        token: "your-jwt-token"  // Include your JWT token for authentication
    }
});

socket.on("connect", () => {
    console.log("Connected to server");

    // Listen for chat messages from the server
    socket.on("chatMessage", (msg) => {
        console.log("New chat message received:", msg);
    });

    // Send a message to the chat
    const message = {
        from: "user1",
        to: "user2",
        text: "Hello, this is a test message!"
    };
    
    socket.emit("chatMessage", message, (response) => {
        console.log("Server response:", response);
    });
});

// Handle disconnection
socket.on("disconnect", () => {
    console.log("Disconnected from server");
});