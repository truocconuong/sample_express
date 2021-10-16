const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const {
  Director, Leader, Member,
} = require('../common/util');

const clientController = controller.Client;
const authController = controller.Auth;

Router.get('/api/admin/client', authController.authenticateRole([Director, Leader, Member]), clientController.getClient);

Router.get('/api/client/:id', authController.authenticateRole([Director, Leader, Member]), clientController.getDetailClient);

Router.post('/api/admin/client', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    about: Joi.string().required(),
    website: Joi.string().allow(null, ''),
    background: Joi.string().allow(null, ''),
  }),
}), authController.authenticateRole([Director, Leader, Member]), clientController.postClient);

Router.patch('/api/admin/client/:id', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required(),
    about: Joi.string().required(),
    website: Joi.string().allow(null, ''),
    background: Joi.string().allow(null, ''),
  }),
}), authController.authenticateRole([Director, Leader, Member]), clientController.updateClient);

Router.delete('/api/admin/client/:id', authController.authenticateRole([Director, Leader]), clientController.deleteClient);

Router.get('/api/all/client', clientController.getAllClient);

Router.patch('/api/v1/generate-token/client/:id', authController.authenticateRole([Director, Leader, Member]), clientController.generateToken);

Router.post('/api/v1/short-link', clientController.shortLinkAllowCandidate);

Router.post('/api/v1/short-link/recruiter', clientController.shortLinkShareRecruiter);

Router.get('/api/v1/client/:id/jobs', clientController.getAllJobOfClient);

Router.use(errors());
module.exports = Router;
