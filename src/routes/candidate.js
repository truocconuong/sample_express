const Router = require('express').Router();
const { errors } = require('celebrate');
const controller = require('../controllers');
const {
  Director, Leader, Member,
} = require('../common/util');

const candidateController = controller.Candidate;
const authController = controller.Auth;

Router.post('/api/candidate', candidateController.postCandidate);
Router.get('/api/admin/candidate', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateAdmin);
Router.get('/api/admin/cv/candidate/:id', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateCv);
Router.get('/api/admin/preview/cv/candidate/:id', authController.authenticateRole([Director, Leader, Member]), candidateController.previewCandidateCv);
Router.get('/api/candidate/job/:idJob', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateToJob);
Router.get('/api/candidate/interview/:idJob', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateInterview);
Router.get('/api/addCard/candidate/:id', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateAddCard);
Router.get('/api/admin/applicants/candidate', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateByJob);
// candidate detail in job detail
Router.get('/api/detail/candidate/:id', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidatePopupDetail);
// candidate detail in table candidate
Router.get('/api/admin/candidate/detail/:id', authController.authenticateRole([Director, Leader, Member]), candidateController.getDetailCandidate);
Router.get('/api/admin/candidate/user', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateOfUser);
Router.get('/api/admin/search/candidate', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateSearchAdmin);
Router.get('/api/admin/search/phone/candidate', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateOfUserByPhone);
Router.get('/preview/candidate/:candidateId/job/:jobId', authController.authenticateRole([Director, Leader, Member]), candidateController.getCandidateJob);
Router.post('/api/v1/candidate/make/pdf', authController.authenticateRole([Director, Leader, Member]), candidateController.makePdf);
Router.get('/api/v1/admin/preview/pdf/candidateJob/:id', candidateController.previewPdf);
Router.get('/api/v1/admin/preview/pdf/refine/candidateJob/:id', candidateController.previewPdfRefine);
Router.post('/api/v1/download/pdf/private', candidateController.downloadPdfPrivate);
Router.get('/api/v1/refine/test', candidateController.testRefinePdf);

Router.post('/api/v1/check/candidate', candidateController.checkExistCandidate);
Router.get('/api/v1/candidate/recruiter/:id', candidateController.listCandidateRecruiter);
Router.get('/api/v1/candidate/recruiter/:id/job/:jobId', candidateController.listCandidateRecruiterJob);

Router.get('/api/v1/candidate-job/client/:tokenClient/job/:jobId', candidateController.getAllCandidateByClientJob);
Router.get('/api/v1/sales/candidate-job/client/:clientId/job/:jobId', candidateController.getAllCandidateByClientIdJob);
Router.post('/api/v1/assign/leader/card-recruiter', candidateController.assignLeaderToCandidateJob);

Router.use(errors());

module.exports = Router;
