const service = require('../services/admin');

const fetchPosts = (req, res) => {
    const { id, parentId, author, body, private, page, size } = req.query;

    service.fetchPosts(id, parentId, author, body, private, page, size)
        .then((posts) => {
            res.status(200).json(posts);
        })
        .catch((err) => {
            res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
        });
}

const editPost = async (req, res) => {
    try{
        const { blocked } = req.body;
        const { id } = req.params;

        await service.editPost(id, blocked);

        res.status(200).json({message: 'SnapMsg has been successfully updated.'});
    } catch(err){
        res.status(err.statusCode ?? 500).json({ message: err.message ?? 'An unexpected error has occurred. Please try again later.'});
    }
}

module.exports = {
    fetchPosts,
    editPost
}
