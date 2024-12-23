import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "harbinger",
  brokers: [process.env.KAFKA_BROKER],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "harbinger-group" });

(async () => {
  await producer.connect();
  await consumer.connect();
  console.log("Kafka producer and consumer connected");
})();
