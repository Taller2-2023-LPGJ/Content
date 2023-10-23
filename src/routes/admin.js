const { Router } = require('express');
const router = Router();

const {
    fetchPosts,
} = require('../controllers/admin');

router.get('/', fetchPosts);

module.exports = router;
