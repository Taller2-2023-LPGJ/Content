const { Router } = require('express');
const router = Router();

const {
    post
} = require('../controllers/statistics');

router.get('/post/:username', post);

module.exports = router;
