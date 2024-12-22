const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'harbinger',
    brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'harbinger-group' });

(async () => {
    await producer.connect();
    await consumer.connect();
    console.log('Kafka producer and consumer connected');
})();

module.exports = { kafka, producer, consumer };