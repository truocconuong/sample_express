const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const { Director } = require('../common/util');

const locationController = controller.Location;
const authController = controller.Auth;

Router.get('/api/location', locationController.getAllLocation);

Router.post('/api/admin/location', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    office: Joi.string().allow(null, ''),
    descLocation: Joi.string().allow(null, ''),
    linkMap: Joi.string().allow(null, ''),
  }),
}), authController.authenticateRole([Director]), locationController.postLocation);

Router.patch('/api/admin/location/:id', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().required(),
    office: Joi.string().allow(null, ''),
    descLocation: Joi.string().allow(null, ''),
    linkMap: Joi.string().allow(null, ''),
  }),
}), authController.authenticateRole([Director]), locationController.updateLocation);

Router.delete('/api/admin/location/:id', authController.authenticateRole([Director]), locationController.deleteLocation);

Router.use(errors());
module.exports = Router;
