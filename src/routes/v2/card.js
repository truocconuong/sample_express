const Router = require('express').Router();
const { errors } = require('celebrate');
const controllers = require('../../controllers');
const {
  Director, Leader,
} = require('../../common/util');

const cardV2Controller = controllers.V2.Card;
const authController = controllers.Auth;

Router.get('/cards', authController.authenticateRole([Director, Leader]), cardV2Controller.test);

Router.use(errors());
module.exports = Router;
