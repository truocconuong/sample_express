const Router = require('express').Router();
const { celebrate, Joi, errors } = require('celebrate');
const controller = require('../controllers');
const {
  Director, Leader, Member, Admin,
} = require('../common/util');

const cardController = controller.Card;
const authController = controller.Auth;

// da fix
Router.post('/api/cards', authController.authenticateRole([Leader, Member]), celebrate({
  body: Joi.object().keys({
    name: Joi.string().allow(null, ''),
    approachDate: Joi.string().required().max(40),
    linkCv: Joi.string().allow(null, ''),
    linkPortfolio: Joi.string().allow(null, ''),
    facebook: Joi.string().allow(null, ''),
    linkedin: Joi.string().allow(null, ''),
    skype: Joi.string().allow(null, ''),
    position: Joi.string().allow(null, ''),
    clientName: Joi.string().allow(null, ''),
    phone: Joi.string().allow(null, ''),
    email: Joi.string().allow(null, ''),
    location: Joi.string().allow(null, ''),
    noteApproach: Joi.string().allow(null, ''),
    nameJob: Joi.string().required().max(100),
    idJob: Joi.string().required().max(50),
    laneId: Joi.string().required(),

  }),
}), cardController.addCard);

// done
Router.get('/api/cards/:idCard', authController.authenticateRole([Director, Leader, Member]), cardController.detailCard);

Router.patch('/api/cards/:idCard', authController.authenticateRole([Director, Leader, Member]), cardController.updateCard);

// done
Router.patch('/api/cards/assignment/:idCard', authController.authenticateRole([Leader, Member]), celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
}), cardController.assignmentCard);

// done
Router.patch('/api/cards/remove/assignment/:idCard', authController.authenticateRole([Leader, Director]), celebrate({
  body: Joi.object().keys({
    userId: Joi.string().required(),
  }),
}), cardController.removeUserCard);

Router.post('/api/dashboard/cv', authController.authenticateRole([Leader, Director]), celebrate({
  body: Joi.object().keys({
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
  }),
}), cardController.getTotalCv);

Router.post('/api/cards/upload/cv', cardController.uploadDriver);

Router.get('/api/cards/cv/user/:id', authController.authenticateRole([Director, Leader, Member]), cardController.listTotalCv);

Router.post('/api/cards/faker', cardController.createCardFake);

Router.get('/api/admin/card/recruitment', authController.authenticateRole([Director, Leader, Member]), cardController.listCardReCruitment);

Router.get('/api/admin/cards/:id/lane',
  authController.authenticateRole([Director, Leader, Member]), cardController.getAllCardsLane);

Router.get('/api/search/board/members', authController.authenticateRole([Director, Leader]), cardController.searchMembers);

Router.get('/api/v1/search/card', authController.authenticateRole([Director, Leader, Member]), cardController.searchCards);

Router.get('/api/v1/cards', authController.authenticateRole([Director, Leader, Member]), cardController.getAllCard);

Router.post('/api/v1/card/label', authController.authenticateRole([Director, Leader, Member]), cardController.createLabel);

Router.delete('/api/v1/card/:id/label', authController.authenticateRole([Director, Leader, Member]), cardController.removeLabel);

Router.post('/api/v1/comment/:cardId/card', authController.authenticateRole([Director, Leader, Member]),
  celebrate({
    body: Joi.object().keys({
      content: Joi.string().required(),
    }),
  }),
  cardController.createComment);

Router.get('/api/v1/comment/:cardId/card', authController.authenticateRole([Director, Leader, Member]),
  cardController.getCommentCard);

Router.delete('/api/v1/comment/:commentId', authController.authenticateRole([Director, Leader, Member]),
  cardController.destroyCommentCard);

Router.patch('/api/v1/comment/:commentId', authController.authenticateRole([Director, Leader, Member]),
  cardController.updateCommentCard);

Router.get('/api/v1/label', authController.authenticateRole([Director, Leader, Member]),
  cardController.getAllLabel);

Router.get('/api/v1/admin-new/cards', authController.authenticateRole([Director, Leader, Member, Admin]), cardController.listCardForNewAdmin);

Router.use(errors());
module.exports = Router;
