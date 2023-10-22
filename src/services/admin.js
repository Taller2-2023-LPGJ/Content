const database = require('../database/admin');
const {
    fetchProfileData,
} = require('./post');

async function fetchPosts(id, parentId, author = '', body = '', private = null, page = 0, size = 15){
    if((id && isNaN(+id)) || (parentId && isNaN(+parentId)))
        return [];
 
    try{
        const posts = await database.fetchPosts(id ? +id : null, parentId ? +parentId : null, author, body, private, page, size);
        const displayNames = await fetchProfileData(posts.map(post => post.author));

        return posts.map((post) => ({
            ...post,
            displayName: displayNames[post.author] || '',
        }));
	} catch(err){
		throw err;
	}
}

module.exports = {
    fetchPosts
}
