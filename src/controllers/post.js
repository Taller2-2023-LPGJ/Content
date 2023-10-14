const service = require('../services/post');

const createPost = (req, res) => {
    const { username, body, private, tags } = req.body;
    const { id } = req.params;

    service.createPost(id, username, body, private, tags)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully created.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const editPost = (req, res) => {
    const { username, body, private, tags } = req.body;
    const { id } = req.params;

    service.editPost(id, username, body, private, tags)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully edited.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const deletePost = (req, res) => {
    const { username } = req.body;
    const { id } = req.params;

    service.deletePost(id, username)
        .then(() => {
            res.status(200).json({message: 'SnapMsg successfully deleted.'});
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const fetchPosts = (req, res) => {
    const { username, page, author } = req.query;
    const { id } = req.params;

    service.fetchPosts(username, id, author, page)
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

module.exports = {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
}
