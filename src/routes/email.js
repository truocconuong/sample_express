const Router = require('express').Router();
const { celebrate, errors, Joi } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const emailController = controller.Email;
const authController = controller.Auth;

Router.post('/api/v1/email', celebrate({
  body: Joi.object().keys({
    createdBy: Joi.string().required(),
    emailTo: Joi.string().email().required(),
    inCC: Joi.string().email({ multiple: true }).allow(null, ''),
    body: Joi.string().required(),
    emailType: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader, Member]), emailController.addEmail);

Router.use(errors());

module.exports = Router;
