const service = require('../services/fav');

const fav = (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    service.fav(id, username)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully added to favourites list.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const unfav = (req, res) => {
    const { id } = req.params;
    const { username } = req.body;

    service.unfav(id, username)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully removed from favourites list.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const favs = (req, res) => {
    const { username, page } = req.query;

    service.favs(username, page)
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

module.exports = {
    fav,
    unfav,
    favs
}
