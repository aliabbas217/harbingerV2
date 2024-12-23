import mongoose from "mongoose";
import { httpServer } from "./app.js";

import { startConsumer, disconnectConsumer } from "./kafka/consumer.js";
import { startProducer, disconnectProducer } from "./kafka/producer.js";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB-${process.env.ENVIRONMENT}`);
  })
  .catch((error) => {
    console.log("Error Connecting to MongoDB:", error);
  });

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const shutDown = async () => {
  console.log("\nShutting down server...");
  mongoose.connection
    .close()
    .then(() => {
      console.log("Connection with MongoDB closed");
    })
    .catch((error) => {
      console.log(
        `Error occoured while closing connection with Mongo:${error}`
      );
    });
  await disconnectProducer();
  await disconnectConsumer();
  httpServer.close(() => {
    console.log("Server dumped");
  });
};

process.on("SIGINT", shutDown);
process.on("SIGTERM", shutDown);
