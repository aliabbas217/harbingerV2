const { consumer } = require("./kafka");

const fetchMessagesOnce = async (topicName) => {
  try {
    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    const messages = [];
    let processingDone = false;

    const processPromise = new Promise((resolve, reject) => {
      consumer
        .run({
          eachMessage: async ({ topic, partition, message }) => {
            messages.push({
              topic,
              partition,
              value: JSON.parse(message.value.toString()),
              key: message.key?.toString(),
              offset: message.offset,
              timestamp: message.timestamp,
            });

            if (messages.length >= 100) {
              processingDone = true;
            }
          },
        })
        .then(resolve)
        .catch(reject);
    });

    await processPromise;

    await consumer.disconnect();

    console.log(
      `Fetched ${messages.length} messages from topic "${topicName}"`
    );
    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

module.exports = { fetchMessagesOnce };
