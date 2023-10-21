const database = require('../database/share');
const Exception = require('./exception');

async function share(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);
 
    try{
        await database.share(+id, username);
	} catch(err){
		throw err;
	}
}

async function unshare(id, username){
    if(isNaN(+id))
        throw new Exception('SnapMsg not found.', 404);

    try{
		await database.unshare(+id, username);
	} catch(err){
		throw err;
	}
}

module.exports = {
    share,
    unshare,
}
