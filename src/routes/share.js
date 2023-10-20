const { Router } = require('express');
const router = Router();

const {
    share,
    unshare,
} = require('../controllers/share');

router.post('/:id', share);
router.delete('/:id', unshare);
//router.get('/', favs);

module.exports = router;
