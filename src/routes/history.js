const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const historyController = controller.History;
const authController = controller.Auth;

Router.post(
  '/api/history/card',
  celebrate({
    body: Joi.object().keys({
      cardId: Joi.string().required(),
    }),
  }),
  authController.authenticateRole([Director, Leader, Member]),
  historyController.getHistoryByIdCard,
);

Router.post(
  '/api/history/job',
  celebrate({
    body: Joi.object().keys({
      idJob: Joi.string().required(),
    }),
  }),
  authController.authenticateRole([Director, Leader, Member]),
  historyController.getHistoryByIdJob,
);

Router.use(errors());
module.exports = Router;
