const { Router } = require('express');
const router = Router();

const {
    like,
    unlike,
} = require('../controllers/like');

router.post('/:id', like);
router.delete('/:id', unlike);

module.exports = router;
