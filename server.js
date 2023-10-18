require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const follow = require('./src/routes/follow');
const post = require('./src/routes/post');
const like = require('./src/routes/like');
const fav = require('./src/routes/fav');

const app = express();
const port = 3002;

app.use(bodyParser.json());

app.use('/follow', follow);
app.use('/post', post);
app.use('/like', like);
app.use('/fav', fav);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
