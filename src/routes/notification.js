const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');
const {
  Director, Leader, Member, Admin,
} = require('../common/util');

const authController = controller.Auth;
const notificationController = controller.Notification;

Router.get('/api/admin/notification', authController.authenticateRole([Director, Leader, Member, Admin]), notificationController.getAllNotification);

Router.patch('/api/read/all/notification', authController.authenticateRole([Director, Leader, Member]), notificationController.readAllNotification);

Router.patch('/api/read/notification/:id', authController.authenticateRole([Director, Leader, Member]), notificationController.readNotification);

Router.get('/api/v1/admin/all-notification', authController.authenticateRole([Director, Leader, Member]), notificationController.getNotifications);

Router.use(errors());

module.exports = Router;
