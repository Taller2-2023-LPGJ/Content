const service = require('../services/share');

const share = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.share(id, username);
    
        res.status(200).json({message: 'SnapMsg successfully shared.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const unshare = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.unshare(id, username);

        res.status(200).json({message: 'SnapMsg successfully unshared.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

module.exports = {
    share,
    unshare,
}
