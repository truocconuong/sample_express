const Router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const controller = require('../controllers/index');
const {
  Admin, Director, Leader, Member,
} = require('../common/util');

Router.post(
  '/api/v1/list-task',
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().required(),
      content: Joi.string().required(),
      startDate: Joi.date().required(),
      dueDate: Joi.date().required(),
      status: Joi.string().required(),
      tag: Joi.string().allow(null),
      parentId: Joi.string().allow(null),
    }),
  }),
  controller.Auth.authenticateRole([Admin]),
  controller.ListTask.postNewTask,
);

// assign new user to tasks
Router.post(
  '/api/v1/list-task/:taskId/user',
  celebrate({
    body: Joi.object().keys({
      userId: Joi.string().required(),
    }),
  }),
  controller.Auth.authenticateRole([Admin, Director, Leader, Member]),
  controller.ListTask.assginNewUser,
);

Router.post(
  '/api/v1/sub-task',
  celebrate({
    body: Joi.object().keys({
      title: Joi.string().required(),
      content: Joi.string().required(),
      startDate: Joi.date().required(),
      dueDate: Joi.date().required(),
      status: Joi.string().required(),
      tag: Joi.string().allow(null),
      parentId: Joi.string().required(),
    }),
  }),
  controller.Auth.authenticateRole([Admin, Director, Leader, Member]),
  controller.ListTask.postNewSubTask,
);

Router.get('/api/v1/list-task', controller.Auth.authenticateRole([Admin, Director, Leader, Member]), controller.ListTask.getAllTask);

Router.get('/api/v1/list-task/:taskId', controller.ListTask.getTaskById);

Router.get(
  '/api/v1/sub-task/:parentId',
  controller.Auth.authenticateRole([Admin, Director, Leader, Member]),
  controller.ListTask.getListTaskByParentId,
);

Router.patch(
  '/api/v1/list-task/:taskId',
  controller.Auth.authenticateRole([Admin, Director, Leader, Member]),
  controller.ListTask.updateListTask,
);

Router.delete('/api/v1/list-task/:taskId', controller.Auth.authenticateRole([Admin]), controller.ListTask.deleteTask);

Router.delete('/api/v1/task/:taskId/user/:userId', controller.Auth.authenticateRole([Admin, Director, Leader, Member]), controller.ListTask.deleteAssignUser);

module.exports = Router;
