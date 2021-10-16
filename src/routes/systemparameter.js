const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const systemParameterController = controller.SystemParameter;
const authController = controller.Auth;

Router.get('/api/all/systems', authController.authenticateRole([Director, Leader, Member]), systemParameterController.getAllSystemParameter);
Router.patch('/api/update/systems', authController.authenticateRole([Director, Leader, Member]), systemParameterController.updateAllSystems);

Router.use(errors());

module.exports = Router;
