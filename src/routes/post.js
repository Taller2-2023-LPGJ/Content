const { Router } = require('express');
const router = Router();

const {
    createPost,
    editPost,
    deletePost,
    fetchPosts,
} = require('../controllers/post');

router.post('/', createPost);                   //Create Post
router.post('/:id', createPost);                //Create Comment
router.put('/:id', editPost);                   //Edit Post or Comment
router.delete('/:id', deletePost);              //Delete Post or Comment
router.get('/', fetchPosts);
router.get('/:id', fetchPosts);

module.exports = router;
