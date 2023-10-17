const axios = require('axios');
const database = require('../database/post');
const Exception = require('./exception');

async function createPost(parentId = 0, username, body, private = false, tags = []){
    if(!body)
        throw new Exception("A SnapMsg's body must not be empty.", 403);
    else if(body.length > 280)
        throw new Exception("SnapMsgs must be 280 or less characters long.", 403);

    try{
		const id = await database.createPost(isNaN(parentId) ? 0 : +parentId, username, body, private);
		await database.addTags(id, tags);
	} catch(err){
		throw err;
	}
}

async function editPost(id, username, body, private = false, tags = []){
    if(!body)
        throw new Exception("A SnapMsg's body must not be empty.", 403);
    else if(body.length > 280)
        throw new Exception("SnapMsgs must be 280 or less characters long.", 403);

    try{
		await database.editPost(isNaN(id) ? 0 : +id, username, body, private);
        await database.editTags(isNaN(id) ? 0 : +id, tags);
	} catch(err){
		throw err;
	}
}

async function deletePost(id, username){
    try{
		await database.deletePost(isNaN(id) ? 0 : +id, username);
	} catch(err){
		throw err;
	}
}

async function fetchDisplayNames(usernames){
    try{
        const displayNames = await axios.post(process.env.PROFILE_URL + 'displayNames', {authors: usernames});

        if(!displayNames)
            throw new Exception('An unexpected error has occurred. Please try again later', 500);

        return displayNames.data;
	} catch(err){
        if(axios.isAxiosError(err))
            throw new Exception('An unexpected error has occurred. Please try again later', 500);
        throw err;
    }
}

async function fetchPosts(username, parentId = 0, author, page = 0){
    parentId = isNaN(parentId) ? 0 : +parentId;
    let posts;

    try{
		if(!author)
            posts = await database.fetchPosts(username, parentId, page);
        else
            posts = await database.fetchUserPosts(username, author, page);

        if(posts.length === 0){
            if(parentId === 0)
                throw new Exception('It may seem as if you have no more SnapMsgs to see. Go catch some fresh air and come back later!', 200);
            else
                throw new Exception('It may seem as if this SnapMsg has no comments. Go ahead and be the first one!', 200);
        }    

        const displayNames = await fetchDisplayNames(author ? [author] : posts.map(post => post.author));
        const tags = await database.fetchTags(parentId, posts.map(post => +post.id));

        return posts.map((post) => ({
            ...post,
            displayName: displayNames[post.author] || '',
            tags: tags[post.id]
        }));
	} catch(err){
	    	console.log(err);
		throw err;
	}
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
}
