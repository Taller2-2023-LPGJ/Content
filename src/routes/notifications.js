const { Router } = require('express');
const router = Router();

const {
    sendNotificationsForUser
} = require('../controllers/notifications');

router.post('/sendnotificationsforuser', sendNotificationsForUser);

module.exports = router;