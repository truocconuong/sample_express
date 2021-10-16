const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');

const sendMailController = controller.SendMail;

Router.post('/api/mail/build-team', sendMailController.sendMailBuildTeam);
Router.post('/api/mail/house-team', sendMailController.sendMailHouseTeam);

Router.use(errors());

module.exports = Router;
