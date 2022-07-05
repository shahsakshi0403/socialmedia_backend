const express = require('express');

const { httpRegisterUser, httpLoginUser, httpGetUser, httpDeleteUser } = require('./users.controller');
const { registerUserValidator, Validation, loginUserValidator } = require('../../validation/users.validation');
const { authenticateToken } = require('../../services/auth');

const usersRouter = express.Router();

usersRouter.post('/register', registerUserValidator(), Validation, httpRegisterUser);

usersRouter.post('/login', loginUserValidator(), Validation, httpLoginUser);

usersRouter.get('/', authenticateToken(true), httpGetUser);

usersRouter.delete('/:id',authenticateToken(true),httpDeleteUser);

module.exports = usersRouter;