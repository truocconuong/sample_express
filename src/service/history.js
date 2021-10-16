const { History, User } = require('../../models');

const insertHistory = async (data) => {
  let history = await History.create(
    data,
  );
  return history;
};

const getHistoryByIdCard = async (idCard) => {
  let history = await History.findAll({
    where: {
      idCard,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'linkAvatar'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  return history;
};

const getHistoryByIdJob = async (idJob) => {
  let history = await History.findAll({
    where: {
      idJob,
    },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'linkAvatar'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  return history;
};
module.exports = {
  insertHistory,
  getHistoryByIdCard,
  getHistoryByIdJob,
};
