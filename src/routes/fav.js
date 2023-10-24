const { Router } = require('express');
const router = Router();

const {
    fav,
    unfav,
    favs
} = require('../controllers/fav');

router.post('/:id', fav);
router.delete('/:id', unfav);
router.get('/', favs);

module.exports = router;
