const database = require('../database/like');
const Exception = require('./exception');

async function like(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);
 
    try{
        await database.like(+id, username);
	} catch(err){
		throw err;
	}
}

async function unlike(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);

    try{
		await database.unlike(+id, username);
	} catch(err){
		throw err;
	}
}

module.exports = {
    like,
    unlike,
}
