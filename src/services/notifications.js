const axios = require('axios');
const database = require('../database/notifications');

const typeNotificationMentions = 1;

async function sendNotificationsForUser(username){
    try{
		var notifications = await database.notifications(username);
        notifications.forEach(notification => {
            if(typeNotificationMentions===1){
                sendNotification(notification.id, notification.subID, notification.postId, "SnapMsg Mention", notification.sender);
            }
        });
	} catch(err){
        console.log(err);
		throw err;
	}
}

async function sendNotification(id, username, post_id, title, sender){
    const pushData = "{ " + '"type": "trending","goto":' + '"' + post_id + '"} ';
    var message = sender + " mentioned you in a SnapMsg " + post_id
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

module.exports = {
    sendNotificationsForUser,
}
