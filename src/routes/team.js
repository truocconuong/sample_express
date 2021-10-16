const Router = require('express').Router();
const { celebrate, errors, Joi } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader } = require('../common/util');

const teamController = controller.Team;
const authController = controller.Auth;

Router.post('/api/teams', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().max(50),
    idLeader: Joi.string().allow(null, ''),
  }),
}), authController.authenticateRole([Director]), teamController.addTeam);

Router.get('/api/teams/:teamId', authController.authenticateRole([Director]), teamController.detailTeam);

Router.patch('/api/teams/:teamId', authController.authenticateRole([Director]), teamController.updateTeam);

Router.delete('/api/teams/:teamId', authController.authenticateRole([Director]), teamController.deleteTeam);

Router.get('/api/teams', authController.authenticateRole([Director]), teamController.getListTeam);

Router.get('/api/all/team', authController.authenticateRole([Director, Leader]), teamController.getAllTeam);

Router.use(errors());
module.exports = Router;
