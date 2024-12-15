const { consumer } = require('./kafka');

const consumeMessages = async (topicName, onMessage) => {
    try {
        // Subscribe to the topic
        await consumer.subscribe({ topic: topicName, fromBeginning: true });

        // Listen for new messages
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value.toString();
                console.log(`Received message from topic "${topic}":`, value);
                if (onMessage) {
                    onMessage(JSON.parse(value)); // Pass the parsed message to the callback
                }
            },
        });

        console.log(`Consumer listening to topic "${topicName}"`);
    } catch (error) {
        console.error('Error consuming messages:', error);
    }
};

module.exports = { consumeMessages };
