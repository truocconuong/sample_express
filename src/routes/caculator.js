const Router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const controller = require('../controllers');

const caculatorController = controller.Caculator;

Router.post('/api/v1/caculator/salary', celebrate({
  body: Joi.object().keys({
    salary: Joi.number().required(),
    insuraneMoney: Joi.number().required(),
    type: Joi.number().required(),
    peopleDependent: Joi.number().required(),
    pvi: Joi.number().required(),
  }),
}), caculatorController.caculatorSalary);

module.exports = Router;
