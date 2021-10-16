const Router = require('express').Router();
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const roleController = controller.Role;
const authController = controller.Auth;

Router.get('/api/all/role', authController.authenticateRole([Director, Leader, Member]), roleController.getAllRole);

module.exports = Router;
