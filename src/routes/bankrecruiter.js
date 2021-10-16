const Router = require('express').Router();
const controller = require('../controllers/index');
const authController = require('../controllers/auth');
const { Recruiter } = require('../common/util');

Router.post('/api/v1/bankrecruiter', authController.authenticateRole([Recruiter]), controller.BankRecruiter.postNewBankRecruiter);

Router.post('/api/v1/bankrecruiter/upload/idcard', authController.authenticateRole([Recruiter]), controller.BankRecruiter.uploadDriver);

Router.get('/api/v1/bankrecruiter', authController.authenticateRole([Recruiter]), controller.BankRecruiter.getAllBankRecruiter);

Router.patch('/api/v1/bankrecruiter/:userId', authController.authenticateRole([Recruiter]), controller.BankRecruiter.updateBankRecruiterByUserId);

Router.delete('/api/v1/user/:recruiterId/bankrecruiter', authController.authenticateRole([Recruiter]), controller.BankRecruiter.deleteBankRecruiterByUserId);

Router.get('/api/v1/user/:recruiterId/bankrecruiter', authController.authenticateRole([Recruiter]), controller.BankRecruiter.getBankRecruiterByRecruiterId);

module.exports = Router;
