const express = require('express');
const employeesRouter = require('./employee');
const menuRouter = require('./menu');

const apiRouter = express.Router();

apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menuRouter);

module.exports = apiRouter;