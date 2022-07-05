const express = require('express');

const { httpCreatePost, httpGetPost, httpPostActions, httpTopActions, httpGetPostById ,httpDeletePost} = require('./post.controller');
const { authenticateToken } = require('../../services/auth');
const { postValidator, checkActionValidator, Validation } = require('../../validation/post.validation');
const { check } = require('express-validator');

const postRouter = express.Router();

postRouter.put('/', authenticateToken(), postValidator(), Validation, httpCreatePost);

postRouter.get('/', authenticateToken(),
    [check("like").custom(checkActionValidator),
    check("dislike").custom(checkActionValidator)],
    Validation,
    httpGetPost);

postRouter.post('/', authenticateToken(), httpPostActions);

postRouter.get('/topActions', authenticateToken(), httpTopActions);

//this line will work with frontend-backend code.
postRouter.get('/topActions/:action', authenticateToken(), httpTopActions);

//Added this api in frontend task its not part of backend Final task
postRouter.get('/:id',authenticateToken(),httpGetPostById);

postRouter.delete('/:id',authenticateToken(),httpDeletePost);


module.exports = postRouter;