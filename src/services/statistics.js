const databasePost = require('../database/post');
const databaseLike = require('../database/like');
const databaseShare = require('../database/share');
const Exception = require('./exception');

async function post(username, startdate, finaldate){
    try{
        var data = {
            numberPublications: 0,
            numberLikes: 0,
            numberComments: 0,
            numberSharedPosts: 0
        };
        data.numberPublications = await databasePost.numberPublications(username, startdate, finaldate);
        data.numberLikes = await databaseLike.numberLikes(username, startdate, finaldate);
        data.numberComments = await databasePost.numberComments(username, startdate, finaldate);
        data.numberSharedPosts = await databaseShare.numberSharedPosts(username, startdate, finaldate);
        return data;
	} catch(err){
		throw err;
	}
}



module.exports = {
    post
}
