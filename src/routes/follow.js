const { Router } = require('express');
const router = Router();

const {
    follow,
    unfollow,
    viewFollowers,
    viewFollowed,
    count,
} = require('../controllers/follow');

router.get('/:target/followers', viewFollowers);
router.get('/:target/followed', viewFollowed);
router.get('/:username', count);
router.post('/:target', follow);
router.delete('/:target', unfollow);

module.exports = router;
