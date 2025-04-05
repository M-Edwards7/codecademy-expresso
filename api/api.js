const express = require('express');
const employeesRouter = require('./employee');

const apiRouter = express.Router();

apiRouter.use('/employees', employeesRouter);

module.exports = apiRouter;