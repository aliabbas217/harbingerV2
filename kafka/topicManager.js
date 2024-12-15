const { kafka } = require('./kafka');

const admin = kafka.admin();

(async () => {
    await admin.connect();
    console.log('Kafka admin connected');
})();

const createTopic = async (topicName) => {
    try {
        const topics = await admin.listTopics();
        if (!topics.includes(topicName)) {
            await admin.createTopics({
                topics: [{ topic: topicName }],
            });
            console.log(`Topic "${topicName}" created`);
        } else {
            console.log(`Topic "${topicName}" already exists`);
        }
    } catch (error) {
        console.error('Error creating topic:', error);
    }
};

module.exports = { createTopic };