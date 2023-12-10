const axios = require('axios');
const database = require('../database/notifications');

const typeNotificationMentions = 1;
const typeNotificationMessage = 2;

async function sendNotificationsForUser(username){
    try{
		var notifications = await database.notifications(username);
        notifications.forEach(notification => {
            if(notification.type===typeNotificationMentions){
                var pushData = "{ " + '"type": "trending","goto":' + '"' + notification.postId + '"} ';
                var message = notification.sender + " mentioned you in a SnapMsg " + notification.postId;
                sendNotification(notification.id, notification.subID, message, "SnapMsg Mention", pushData);
            }
            if(notification.type===typeNotificationMessage){
                var pushData = "{ " + '"type": "trending","goto":' + '"' + notification.sender + '"} ';
                var message = notification.sender + " mentioned you in a SnapMsg " + notification.post_id
                sendNotification(notification.id, notification.subID, notification.message, notification.sender, pushData);
            }
        });
	} catch(err){
		throw err;
	}
}

async function sendNotification(id, username, message, title, pushData){
    axios.post(process.env.NOTIFICATION_APP_URL, {
        subID: username,
        appId: process.env.NOTIFICATION_APP_ID,
        appToken: process.env.NOTIFICATION_APP_TOKEN,
        title: title,
        message: message,
        pushData: pushData,
    }).then(async (response) => {
        await database.delet(id);
    })
    .catch(async (error) => {
       
    });
}

async function create(subID, postId, sender, message, type){
    try{
		await database.create(subID, postId, sender, message, type);
	} catch(err){
		throw err;
	}
}
module.exports = {
    create,
    sendNotificationsForUser,
}
