require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const follow = require('./src/routes/follow');
const post = require('./src/routes/post');
const share = require('./src/routes/share');
const like = require('./src/routes/like');
const fav = require('./src/routes/fav');
const admin = require('./src/routes/admin');
const statistics = require('./src/routes/statistics');
const notifications = require('./src/routes/notifications');

const app = express();
const port = 3002;

app.use(bodyParser.json());

app.use('/follow', follow);
app.use('/post', post);
app.use('/share', share);
app.use('/like', like);
app.use('/fav', fav);
app.use('/admin', admin);
app.use('/statistics', statistics);
app.use('/notifications', notifications);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
