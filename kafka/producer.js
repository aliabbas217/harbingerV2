const { producer } = require('./kafka');
const { createTopic } = require('./topicManager');

const sendMessage = async (topicName, message) => {
    try {
        // Ensure the topic exists
        await createTopic(topicName);

        // Produce a message
        await producer.send({
            topic: topicName,
            messages: [
                {
                    key: message.sender, // Use the sender as the message key
                    value: JSON.stringify(message),
                },
            ],
        });

        console.log(`Message sent to topic "${topicName}"`);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

module.exports = { sendMessage };