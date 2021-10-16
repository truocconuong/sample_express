const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const { Director, Leader, Member } = require('../common/util');

const jobController = controller.Job;
const authController = controller.Auth;

Router.post('/api/jobs', celebrate({
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    locationId: Joi.string().required(),
    jobStatus: Joi.string().required(),
    type: Joi.string().required(),
    salary: Joi.string().required(),
    time: Joi.string().required(),
    keyword: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    descJob: Joi.string().allow(null, ''),
    interviewProcess: Joi.string().allow(null, ''),
    extraBenefit: Joi.string().allow(null, ''),
    aboutFetch: Joi.string().required(),
    clientId: Joi.number().integer().allow(null),
    responsibilities: Joi.string().allow(null),
    requirement: Joi.string().allow(null),
    niceToHave: Joi.string().allow(null),
    benefit: Joi.string().allow(null),
    metaJob: Joi.string().required(),
    titlePage: Joi.string().required(),
    skill: Joi.array().items(),
  }),
}), authController.authenticateRole([Director, Leader]), jobController.postJob);

Router.get('/api/jobs', jobController.getAllJobActive);

// không dùng slug nữa
// Router.get('/api/jobs/:slug', jobController.getDetailJob);
// Router.get('/api/jobs/relation/:slugJob', jobController.getJobRelation);

Router.get('/api/detail/jobs/:id', jobController.getDetailJobbyId);
Router.get('/api/jobs/location/:idLocation', jobController.getJobToLocation);
Router.get('/api/relation/job/:id', jobController.getJobRelationToId);

Router.get('/api/admin/jobs', authController.authenticateRole([Director, Leader, Member]), jobController.getListJobAdmin);

Router.get('/api/admin/jobs/:id', authController.authenticateRole([Director, Leader, Member]), jobController.getDetailJobAdmin);

Router.patch('/api/admin/jobs/status/:id', celebrate({
  body: Joi.object().keys({
    jobStatus: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader]), jobController.updateActiveJob);

Router.patch('/api/admin/jobs/:id', celebrate({
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    locationId: Joi.string().required(),
    jobStatus: Joi.string().required(),
    type: Joi.string().required(),
    salary: Joi.string().required(),
    time: Joi.string().required(),
    keyword: Joi.string().allow(null, ''),
    note: Joi.string().allow(null, ''),
    descJob: Joi.string().allow(null, ''),
    interviewProcess: Joi.string().allow(null, ''),
    extraBenefit: Joi.string().allow(null, ''),
    aboutFetch: Joi.string().required(),
    clientId: Joi.number().integer().allow(null),
    responsibilities: Joi.string().allow(null),
    requirement: Joi.string().allow(null),
    niceToHave: Joi.string().allow(null),
    benefit: Joi.string().allow(null),
    description: Joi.string().allow(null),
    metaJob: Joi.string().required(),
    titlePage: Joi.string().required(),
    skill: Joi.array().items(),
    externalRecruiter: Joi.allow(null, ''),
    tags: Joi.array(),

  }),
}), authController.authenticateRole([Director, Leader]), jobController.updateJob);

Router.delete('/api/admin/jobs/:id', authController.authenticateRole([Director]), jobController.deleteJob);

Router.get('/api/dashboard/jobs', authController.authenticateRole([Director, Leader, Member]), jobController.getListJobDashBoard);

Router.get('/api/admin/search/jobs', authController.authenticateRole([Director, Leader, Member]), jobController.getListJobSearch);

Router.get('/api/trello/job/active', authController.authenticateRole([Director, Leader, Member]), jobController.getjobActive);

Router.post('/api/assignment/job/:idJob', celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader]), jobController.assignmentJob);

Router.post('/api/remove/assignment', celebrate({
  body: Joi.object().keys({
    jobId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
}), authController.authenticateRole([Director, Leader]), jobController.removeUserAssignJob);

Router.get('/api/assignment/job/:idJob', authController.authenticateRole([Director, Leader, Member]), jobController.getUserAssignJob);
Router.get('/api/member/assign/:idJob', authController.authenticateRole([Member]), jobController.memberAssignJob);
Router.get('/api/job/user/profile', authController.authenticateRole([Director, Leader, Member]), jobController.getJobUser);
Router.get('/api/download/job/:id', jobController.genPdfJob);
Router.get('/api/v1/job/client', jobController.getAllJob);

Router.get('/api/v1/tags', jobController.allTag);

Router.get('/api/v1/test', jobController.nguyHiem);
Router.use(errors());

module.exports = Router;
