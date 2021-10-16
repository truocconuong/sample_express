const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
// const { Director, Leader, Member } = require('../common/util');

// const authController = controller.Auth;
const socialController = controller.Social;

Router.post('/api/v1/socail/candidate', celebrate({
  body: Joi.object().keys({
    items: Joi.array().min(1).required(),
  }),
}), socialController.candidateSocial);

Router.use(errors());

module.exports = Router;
