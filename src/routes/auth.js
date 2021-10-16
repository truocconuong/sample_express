const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const {
  Director, Leader, Member, Recruiter, Sales, Admin,
} = require('../common/util');

const authController = controller.Auth;

Router.post('/api/sigin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(100),
    password: Joi.string().required().min(8),
  }),
}), authController.sigin);

Router.post('/api/register', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(100),
    password: Joi.string().required().min(8),
    name: Joi.string().required().max(100),
    roleId: Joi.string().required(),
    teamId: Joi.number().allow(null),
  }),
}), authController.authenticateRole([Director, Leader]), authController.register);

Router.get('/api/admin/user', authController.authenticateRole([Director, Leader]), authController.getListUser);
Router.patch('/api/user/:id', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(100),
    name: Joi.string().required().max(100),
    // password: Joi.string().required().min(8),
    roleId: Joi.string().required(),
    teamId: Joi.number().allow(null),
  }),
}), authController.authenticateRole([Director, Leader]), authController.updateUser);

Router.patch('/api/v1/user/:id', authController.updateAllDataUser);

Router.delete('/api/user/:id', authController.authenticateRole([Director]), authController.deleteUser);

Router.post('/api/admin/user/list', authController.authenticateRole([Director, Leader, Member]), authController.getAllUser);

Router.get('/api/detail/user/:id', authController.authenticateRole([Director]), authController.getUser);

Router.get('/api/user/lastlogin', authController.authenticateRole([Director, Leader]), authController.getLastLogin);

Router.get('/api/trello/user', authController.authenticateRole([Director, Leader, Member]), authController.getUserTrello);

Router.get('/api/task/user', authController.authenticateRole([Leader]), authController.getUserTask);

Router.post('/api/checklogin/browser', celebrate({
  body: Joi.object().keys({
    tokenTimeStamp: Joi.string().required(),
  }),
}), authController.checkBrowser);

Router.get('/api/profile', authController.authenticateRole([Director, Leader, Member, Admin, Member]), authController.getProfile);
Router.post('/api/upload/avatar', authController.authenticateRole([Director, Leader, Member]), authController.uploadAvatar);
Router.post('/api/v1/upload/cmnd', authController.uploadCmnd);

Router.get('/api/user/:id', authController.authenticateRole([Director, Leader, Member]), authController.getDetailUser);
Router.get('/api/assign/list/user', authController.authenticateRole([Director, Leader, Admin, Member]), authController.getUserAssign);

Router.get('/api/v1/all/assign/list/user', authController.authenticateRole([Admin]), authController.getAllUserAssign);

Router.get('/api/v1/recruiter', authController.authenticateRole([Director, Leader]), authController.getListUserRecruiter);

Router.get('/api/v1/profile/recruiter', authController.authenticateRole([Recruiter, Sales]), authController.getProfile);

Router.post('/api/v1/recruiter', authController.registerRecruiter);

Router.post('/api/v1/verify', authController.verifyRecruiterByEmail);

Router.get('/api/v1/calc/bonus', authController.authenticateRole([Recruiter, Admin, Director, Leader, Member]), authController.calcBonusOfRecruiter);

Router.get('/api/v1/auth/generate/verify-email/:email', authController.generateKeyVerifyEmail);

Router.get('/api/v1/auth/verify-email/:email/code/:codeVerify', authController.handleVerifyEmail);

Router.post('/api/v1/recruiter/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(100),
    password: Joi.string().required().min(8),
    isRemember: Joi.boolean(),
  }),
}), authController.siginRecruiter);

Router.post('/api/v1/sales/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().max(100),
    password: Joi.string().required().min(8),
    isRemember: Joi.boolean(),
  }),
}), authController.siginSales);

Router.post('/api/v1/forgot/password', authController.forgotPassword);

Router.patch('/api/v1/change/password/token/:token', authController.changePasswordByToken);

Router.patch('/api/v1/change/password', authController.authenticateRole([Recruiter]), authController.changePassword);

Router.post('/api/v1/signin/socials', authController.loginSocials);

Router.use(errors());
module.exports = Router;
