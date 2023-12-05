const database = require('../database/follow');
const Exception = require('./exception');

async function follow(username, target){
	if(username === target)
		throw new Exception('User is forbidden from following themselves.', 403);

	try{
		await database.follow(username, target);
	} catch(err){
		throw err;
	}
}

async function unfollow(username, target){
	if(username === target)
		throw new Exception('User is forbidden from unfollowing themselves.', 403);

	try{
		await database.unfollow(username, target);
	} catch(err){
		throw err;
	}
}

async function viewFollowers(username, target, page = 0){
	try{
		if(username !== target && !(await database.isFetchAuthorized(username, target)))
			throw new Exception("Users must follow each other to view each other's followers.", 403);

		const followers = await database.viewFollowers(target, page);

		return followers.map(item => item.follower);
	} catch(err){
		throw err;
	}
}

async function viewFollowed(username, target, page = 0){
	try{
		if(username !== target && !(await database.isFetchAuthorized(username, target)))
			throw new Exception("Users must follow each other to view each other's followers.", 403);

		const followed = await database.viewFollowed(target, page);

		return followed.map(item => item.followed);
	} catch(err){
		throw err;
	}
}

async function count(target, username){
	try{
		return await database.count(target, username);
	} catch(err){
		throw err;
	}
}

module.exports = {
	follow,
	unfollow,
	viewFollowers,
	viewFollowed,
	count,
};