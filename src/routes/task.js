const Router = require('express').Router();
const { celebrate, errors, Joi } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const taskController = controller.Task;
const authController = controller.Auth;

Router.post('/api/task', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
    content: Joi.array().items(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }),
}), authController.authenticateRole([Leader]), taskController.addTask);

Router.post('/api/task/team', celebrate({
  body: Joi.object().keys({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }),
}), authController.authenticateRole([Director, Leader, Member]), taskController.allTaskTeam);

Router.patch('/api/task/:id', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
    content: Joi.array().items(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  }),
}), authController.authenticateRole([Director, Leader]), taskController.updateTask);

Router.use(errors());
module.exports = Router;
