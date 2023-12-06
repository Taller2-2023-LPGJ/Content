const Exception = require('../services/exception');
const service = require('../services/follow');

const follow = async (req, res) => {
    const { username } = req.body;
    const { target }  = req.params;

    try{
        await service.follow(username, target);

        res.status(200).json({message: 'Attempt to follow ' + target + ' was successful.'});
    } catch(err){
        res.status(err.statusCode).json({ message: err.message });
    }
}

const unfollow = async (req, res) => {
    const { username } = req.body;
    const { target }  = req.params;

    try{
        await service.unfollow(username, target);

        res.status(200).json({message: 'Attempt to unfollow ' + target + ' was successful.'});
    } catch(err){
        res.status(err.statusCode).json({ message: err.message });
    }
}

const viewFollowers = async (req, res) => {
    const { username, page } = req.query;
    const { target }  = req.params;

    try{
        const result = await service.viewFollowers(username, target, page);
    
        res.status(200).json({followers: result});
    } catch(err){
        res.status(err.statusCode).json({ message: err.message });
    }
}

const viewFollowed = async (req, res) => {
    const { username, page } = req.query;
    const { target }  = req.params;

    try{
        const result = await service.viewFollowed(username, target, page);
        
        res.status(200).json({followed: result});
    } catch(err){
        res.status(err.statusCode).json({ message: err.message });
    }
}

const count = async (req, res) => {
    const { target }  = req.params;
    const { username } = req.query;

    try{
        const result = await service.count(target, username);
        
        res.status(200).json(result);
    } catch(err){
        res.status(err.statusCode).json({ message: err.message });
    }
}

module.exports = {
    follow,
    unfollow,
    viewFollowers,
    viewFollowed,
    count,
}
