const express = require('express');
const postRouter = require('./routes/posts/posts.router');
const usersRouter = require('./routes/users/users.router');

const apiErrorHandler = require('./error/apiError-handler');

const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());

app.use('/user', usersRouter);

app.use('/post', postRouter);

app.use(apiErrorHandler);
// app.use('/', (err, req, res, next) => {
//     console.log(err);
//     res.send({ Error: err.message })
// })

module.exports = app;