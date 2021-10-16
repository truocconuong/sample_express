const Router = require('express').Router();
const { errors } = require('celebrate');
const controllers = require('../../controllers');
const {
  Director, Leader, Member,
} = require('../../common/util');

const laneV2Controller = controllers.V2.Lane;
const authController = controllers.Auth;

Router.get('/lane', authController.authenticateRole([Director, Leader, Member]), laneV2Controller.getAllLane);

Router.use(errors());
module.exports = Router;
