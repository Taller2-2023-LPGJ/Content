require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const follow = require('./src/routes/follow');
const post = require('./src/routes/post');

const app = express();
const port = 3002;

app.use(bodyParser.json());

// Include authentication routes
app.use('/follow', follow);
app.use('/post', post);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
