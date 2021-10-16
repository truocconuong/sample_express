const Router = require('express').Router();

const authController = require('../controllers/auth');
const { Recruiter } = require('../common/util');
const controller = require('../controllers/index');

Router.get('/api/v1/recruiter/:id', authController.authenticateRole([Recruiter]), controller.Recruiter.getDetailRecruiter);

Router.patch('/api/v1/recruiter/edit', authController.authenticateRole([Recruiter]), controller.Recruiter.updateRecruiter);

module.exports = Router;

// celebrate({
//     body: Joi.object().keys({
//         name: Joi.string().required(),
//         email: Joi.string().required(),
//         phone: Joi.string().required(),
//         bankrecruiter: {
//             bankNumber: Joi.string().required(),
//             name: Joi.string().required();
//             bankName: Joi.string().required();
//         }
//     })
// })
