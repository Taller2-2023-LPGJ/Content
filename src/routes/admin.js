const { Router } = require('express');
const router = Router();

const {
    fetchPosts,
    editPost,
} = require('../controllers/admin');

router.get('/', fetchPosts);
router.put('/:id', editPost);

module.exports = router;
