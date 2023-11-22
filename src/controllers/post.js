const amqp = require('amqplib');
const service = require('../services/post');
const { postWorker } = require('./postWorker');

const queue = "posts";
let queueInitialized = false;
let connection;
let channel;

const createPost = async (req, res) => {
    const { username, body, private, tags } = req.body;
    const { id } = req.params;

    try{
        if(!connection)
            connection = await amqp.connect("amqp://rabbitmq");        
        if(!channel)
            channel = await connection.createChannel();
        
        channel.assertQueue(queue, { durable: false});
        channel.sendToQueue(queue, Buffer.from(JSON.stringify({id, username, body, private, tags})));

        if(!queueInitialized){
            postWorker(queue);
            queueInitialized = true;
        }

        res.status(200).json({message: 'SnapMsg successfully created.'});
    } catch(err){
        res.status(500).json({ message: 'An unexpected error has occurred. Please try again later.'});
    }
}

const editPost = (req, res) => {
    const { username, body, private, tags } = req.body;
    const { id } = req.params;

    service.editPost(id, username, body, private, tags)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully edited.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const deletePost = (req, res) => {
    const { username } = req.body;
    const { id } = req.params;

    service.deletePost(id, username)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully deleted.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const fetchPosts = (req, res) => {
    const { username, page, author, size } = req.query;
    const postId = req.query.id;
    const body = req.query.body ? decodeURIComponent(req.query.body) : undefined;
    const { id } = req.params;

    service.fetchPosts(username, id, postId, author, body, page, size)
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            console.log(err);
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
}
