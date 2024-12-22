const { producer } = require("./kafka");
const { createTopic } = require("./topicManager");

const sendMessage = async (topicName, message) => {
  try {
    await createTopic(topicName);

    await producer.send({
      topic: topicName,
      messages: [
        {
          key: message.sender,
          value: JSON.stringify(message),
        },
      ],
    });

    console.log(`Message sent to topic "${topicName}"`);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

module.exports = { sendMessage };
