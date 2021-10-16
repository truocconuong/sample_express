const Router = require('express').Router();
const card = require('./card');
const lane = require('./lane');

Router.use(card);
Router.use(lane);

module.exports = Router;
