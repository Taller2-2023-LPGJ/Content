const axios = require('axios');
const database = require('../database/post');
const Exception = require('./exception');

const hashtagSearchRegex = /^#[^#.,;]*$/;
const pageSize = 20;

async function createPost(parentId = 0, username, body, private = false, tags = []){
    if(!body)
        throw new Exception("A SnapMsg's body must not be empty.", 403);
    else if(body.length > 280)
        throw new Exception("SnapMsgs must be 280 or less characters long.", 403);

    try{
		const id = await database.createPost(isNaN(+parentId) ? 0 : +parentId, username, body, private);
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
		await database.editPost(isNaN(+id) ? 0 : +id, username, body, private);
        await database.editTags(isNaN(+id) ? 0 : +id, tags);
	} catch(err){
		throw err;
	}
}

async function deletePost(id, username){
    try{
		await database.deletePost(isNaN(+id) ? 0 : +id, username);
	} catch(err){
		throw err;
	}
}

async function fetchProfileData(usernames){
    try{
        const profileData = await axios.post(process.env.PROFILE_URL + 'profileData', {authors: usernames});

        if(!profileData)
            throw new Exception('An unexpected error has occurred. Please try again later', 500);

        return profileData.data;
	} catch(err){
        if(axios.isAxiosError(err))
            throw new Exception('An unexpected error has occurred. Please try again later', 500);
        throw err;
    }
}

async function fetchPosts(username, parentId = 0, author = null, body = '', page = 0, size = pageSize){
    if(body && body.length > 0){
        if(body[0] === '#')
            body = body.split(' ')[0];
        if(!hashtagSearchRegex.test(body))
            throw new Exception('Hashtag searching may not contain other hashtags or punctuation.');
    }

    parentId = body !== '' || isNaN(+parentId) ? 0 : +parentId;

    if(body.length > 0 && body[0] === '#')
        body = body.split(' ')[0];

    try{
        const posts = await database.fetchPosts(username, page, parentId, author, body, size);

        if(posts.length === 0){
            if(parentId === 0)
                throw new Exception('It may seem as if you have no more SnapMsgs to see. Go catch some fresh air and come back later!', 200);
            else
                throw new Exception('It may seem as if this SnapMsg has no comments. Go ahead and be the first one!', 200);
        }    

        const profileData = await fetchProfileData(author ? [author] : posts.map(post => post.author));

        console.log(profileData);

        return posts.map((post) => ({
            ...post,
            displayName: profileData[post.author].displayName ?? '',
            picture: profileData[post.author].picture ?? '',
            verified: profileData[post.author].verified ?? false
        }));
	} catch(err){
		throw err;
	}
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
    fetchProfileData: fetchProfileData,
}
