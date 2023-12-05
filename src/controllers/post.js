const amqp = require('amqplib');
const service = require('../services/post');
const { postWorker } = require('./postWorker');

const queue = "posts";
let queueInitialized = false;
let connection;
let channel;

const createPost = async (req, res) => {
    const { username, body, tags } = req.body;
    const privateFlag = req.body.private;
    const { id } = req.params;

    try{
        if(!connection)
            connection = await amqp.connect("amqp://rabbitmq");        
        if(!channel)
            channel = await connection.createChannel();

        channel.assertQueue(queue, { durable: false});
        channel.sendToQueue(queue, Buffer.from(JSON.stringify({id, username, body, privateFlag, tags})));

        if(!queueInitialized){
            postWorker(queue);
            queueInitialized = true;
        }

        res.status(200).json({message: 'SnapMsg successfully created.'});
    } catch(err){
        res.status(500).json({ message: 'An unexpected error has occurred. Please try again later.'});
    }
}

const editPost = async (req, res) => {
    const { username, body, tags } = req.body;
    const privateFlag = req.body.private;
    const { id } = req.params;

    try{
        await service.editPost(id, username, body, privateFlag, tags);

        res.status(200).json({message: 'SnapMsg successfully edited.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const deletePost = async (req, res) => {
    const { username } = req.body;
    const { id } = req.params;

    try{
        await service.deletePost(id, username);

        res.status(200).json({message: 'SnapMsg successfully deleted.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const fetchPosts = async (req, res) => {
    const { username, page, author, size } = req.query;
    const postId = req.query.id;
    const body = req.query.body ? decodeURIComponent(req.query.body) : undefined;
    const { id } = req.params;

    try{
        const posts = await service.fetchPosts(username, id, postId, author, body, page, size)

        res.status(200).json(posts);
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
}
