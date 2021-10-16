const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const interviewController = controller.Interview;
const authController = controller.Auth;

Router.get('/api/admin/interview', authController.authenticateRole([Director, Leader, Member]), interviewController.getInterview);

Router.post('/api/admin/interview',
  authController.authenticateRole([Director, Leader, Member]), interviewController.insertInteriew);

Router.patch('/api/admin/interview/:id', authController.authenticateRole([Director, Leader, Member]), interviewController.updateInteriew);

Router.get('/api/admin/interview/:id', authController.authenticateRole([Director, Leader, Member]), interviewController.interviewDetail);

Router.delete('/api/admin/interview/:id', authController.authenticateRole([Director, Leader, Member]), interviewController.interviewDelete);

Router.post('/api/admin/card/interview',
  authController.authenticateRole([Director, Leader, Member]),
  interviewController.insertCardInterview);

Router.get('/api/admin/calendar/interview', authController.authenticateRole([Director, Leader, Member]), interviewController.calendarInterview);

Router.patch('/api/v1/review/interview/:id', interviewController.updateReviewInterview);

Router.use(errors());

module.exports = Router;
