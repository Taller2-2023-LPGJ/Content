const { Router } = require('express');
const router = Router();

const {
    create,
    sendNotificationsForUser
} = require('../controllers/notifications');

router.post('/sendnotificationsforuser', sendNotificationsForUser);
router.post('/', create);

module.exports = router;