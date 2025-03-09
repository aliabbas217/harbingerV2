import { httpServer } from "./app.js";
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
const shutDown = async () => {
    console.log("\nShutting down server...");
    httpServer.close(() => {
        console.log("Server dumped");
    });
};
process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
//# sourceMappingURL=server.js.map