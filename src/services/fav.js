const database = require('../database/fav');
const Exception = require('./exception');

const {
    fetchDisplayNames
} = require('./post');

async function fav(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);
 
    try{
        await database.fav(+id, username);
	} catch(err){
		throw err;
	}
}

async function unfav(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);

    try{
		await database.unfav(+id, username);
	} catch(err){
		throw err;
	}
}

async function favs(username, page = 0){
    try{
		const favPosts = await database.favs(username, page);

        const displayNames = await fetchDisplayNames(favPosts.map(post => post.author));

        return favPosts.map((post) => ({
            ...post,
            displayName: displayNames[post.author] || '',
        }));
	} catch(err){
		throw err;
	}
}

module.exports = {
    fav,
    unfav,
    favs,
}
