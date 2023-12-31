const amqp = require('amqplib');
const service = require('../services/notifications');

const sendNotificationsForUser = async (req, res) => {
    const { username } = req.body;

    try{
        service.sendNotificationsForUser(username)
            .then(() => {
                res.status(200).json({message: 'notifications sent.'});
            })
            .catch((err) => {
                res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
            });
    } catch(err){
        res.status(500).json({ message: 'An unexpected error has occurred. Please try again later.'});
    }
}

const create = async (req, res) => {
    const { subID, postId, sender, message, type} = req.body;

    try{
        service.create(subID, postId, sender, message, type)
            .then(() => {
                res.status(200).json({message: 'notifications create.'});
            })
            .catch((err) => {
                res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
            });
    } catch(err){
        res.status(500).json({ message: 'An unexpected error has occurred. Please try again later.'});
    }
}
module.exports = {
    create,
    sendNotificationsForUser
}
