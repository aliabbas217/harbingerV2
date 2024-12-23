import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "horizon",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

export const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    console.log("Producer Disconnected");
  } catch (error) {
    console.error(error);
  }
};
export const startProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka Producer connected");
  } catch (err) {
    console.error("Error connecting Kafka Producer:", err);
  }
};

export const sendMessage = async (topic, message) => {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    console.log(`Message sent to topic ${topic}`);
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

export const sendBatch = async (batchMessages) => {
  try {
    await producer.sendBatch({ batchMessages });
  } catch (error) {
    console.error(error);
  }
};

/*
    Example Batch Structure
*/

// const topicMessages = [
//   {
//     topic: 'topic-a',
//     messages: [{ key: 'key', value: 'hello topic-a' }],
//   },
//   {
//     topic: 'topic-b',
//     messages: [{ key: 'key', value: 'hello topic-b' }],
//   },
//   {
//     topic: 'topic-c',
//     messages: [
//       {
//         key: 'key',
//         value: 'hello topic-c',
//         headers: {
//           'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
//         },
//       }
//     ],
//   }
// ]
