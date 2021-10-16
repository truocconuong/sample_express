const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const skillController = controller.Skill;
const authController = controller.Auth;

Router.get('/api/all/skill', skillController.getAllSkill);

Router.post('/api/skill/admin/search', celebrate({
  body: Joi.object().keys({
    skill: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader, Member]), skillController.searchSkill);

Router.post('/api/skill', celebrate({
  body: Joi.object().keys({
    skill: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader]), skillController.createSkill);

Router.use(errors());

module.exports = Router;
