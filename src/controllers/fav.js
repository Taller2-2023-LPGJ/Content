const service = require('../services/fav');

const fav = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.fav(id, username);

        res.status(200).json({message: 'SnapMsg successfully added to favourites list.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const unfav = async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    try{
        await service.unfav(id, username);

        res.status(200).json({message: 'SnapMsg successfully removed from favourites list.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

const favs = async (req, res) => {
    const { username, page } = req.query;

    try{
        const posts = await service.favs(username, page);

        res.status(200).json(posts);
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

module.exports = {
    fav,
    unfav,
    favs
}
