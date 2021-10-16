const Router = require('express').Router();
const { celebrate, errors, Joi } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const laneController = controller.Lane;
const authController = controller.Auth;
Router.post('/api/lanes', celebrate({
  body: Joi.object().keys({
    nameColumn: Joi.string().required().max(50),
  }),
}), laneController.addLane);

Router.get('/api/lanes/:laneId', authController.authenticateRole([Member, Leader, Director]), laneController.detailLane);

Router.patch('/api/lanes/:laneId', authController.authenticateRole([Member, Leader, Director]), laneController.updateLane);

Router.delete('/api/lanes/:laneId', authController.authenticateRole([Member, Leader, Director]), laneController.deleteLane);

Router.get('/api/lanes', laneController.getListLane);

Router.use(errors());

module.exports = Router;
