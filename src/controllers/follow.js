const Exception = require('../services/exception');
const followSrv = require('../services/follow');

const follow = (req, res) => {
    const { username } = req.body;
    const { target }  = req.params;

    followSrv.follow(username, target)
        .then(() => {
            res.status(200).json({message: 'Attempt to follow ' + target + ' was successful.'});
        })
        .catch((err) => {
            res.status(err.statusCode).json({ message: err.message });
        });
}

const unfollow = (req, res) => {
    const { username } = req.body;
    const { target }  = req.params;

    followSrv.unfollow(username, target)
        .then(() => {
            res.status(200).json({message: 'Attempt to unfollow ' + target + ' was successful.'});
        })
        .catch((err) => {
            res.status(err.statusCode).json({ message: err.message });
        });
}

const viewFollowers = (req, res) => {
    const { username, page } = req.query;
    const { target }  = req.params;

    followSrv.viewFollowers(username, target, page)
        .then((result) => {
            res.status(200).json({followers: result});
        })
        .catch((err) => {
            res.status(err.statusCode).json({ message: err.message });
        });
}

const viewFollowed = (req, res) => {
    const { username, page } = req.query;
    const { target }  = req.params;

    followSrv.viewFollowed(username, target, page)
        .then((result) => {
            res.status(200).json({followed: result});
        })
        .catch((err) => {
            res.status(err.statusCode).json({ message: err.message });
        });
}

const count = (req, res) => {
    const { username }  = req.params;

    followSrv.count(username)
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(err.statusCode).json({ message: err.message });
        });
}

module.exports = {
    follow,
    unfollow,
    viewFollowers,
    viewFollowed,
    count,
}
