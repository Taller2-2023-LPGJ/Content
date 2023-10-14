const followDB = require('../database/follow');
const Exception = require('./exception');

async function follow(username, target){
	if(username === target)
		throw new Exception('User is forbidden from following themselves.', 403);

	try{
		await followDB.follow(username, target);
	} catch(err){
		throw err;
	}
}

async function unfollow(username, target){
	if(username === target)
		throw new Exception('User is forbidden from unfollowing themselves.', 403);

	try{
		await followDB.unfollow(username, target);
	} catch(err){
		throw err;
	}
}

async function viewFollowers(username, target, page = 0){
	try{
		if(username !== target && !(await followDB.isFetchAuthorized(username, target)))
			throw new Exception("Users must follow each other to view each other's followers.", 403);

		const followers = await followDB.viewFollowers(target, page);
		return followers.map(item => item.follower);
	} catch(err){
		throw err;
	}
}

async function viewFollowed(username, target, page = 0){
	try{
		if(username !== target && !(await followDB.isFetchAuthorized(username, target)))
			throw new Exception("Users must follow each other to view each other's followers.", 403);

		const followed = await followDB.viewFollowed(target, page);

		return followed.map(item => item.followed);
	} catch(err){
		throw err;
	}
}

async function count(username){
	try{
		return await followDB.count(username);
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