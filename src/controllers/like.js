const service = require('../services/like');

const like = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.like(id, username);

        res.status(200).json({message: 'SnapMsg successfully liked.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const unlike = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.unlike(id, username);

        res.status(200).json({message: 'SnapMsg successfully unliked.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

module.exports = {
    like,
    unlike
}
