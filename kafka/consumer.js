import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "horizon",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "harbinger" });

export const disconnectConsumer = async () => {
  try {
    await consumer.disconnect();
    console.log("Consumer Disconnected");
  } catch (error) {
    console.error(error);
  }
};

export const startConsumer = async (topicName) => {
  try {
    await consumer.connect();
    console.log("Kafka Consumer connected");

    await consumer.subscribe({ topic: topicName, fromBeginning: true });
    console.log("Subscribed to topic: topicName");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const msgValue = message.value.toString();
        console.log(`Received message: ${msgValue}`);
      },
    });
  } catch (err) {
    console.error("Error starting Kafka Consumer:", err);
  }
};
