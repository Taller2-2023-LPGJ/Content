const amqp = require('amqplib');
const service = require('../services/post');

const postWorker = async (queue) => {
    try{
        const connection = await amqp.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: false });
    
        channel.consume(queue, async (msg) => {
            const { id, username, body, tags } = JSON.parse(msg.content.toString());
            const priv = JSON.parse(msg.content.toString()).private;
            
            await service.createPost(id, username, body, priv, tags);
    
            channel.ack(msg);
        });
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
};


module.exports = {
    postWorker
}
