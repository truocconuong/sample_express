const _ = require('lodash');
const { Notification, User } = require('../../models');

const createNotification = async (data) => {
  const notification = await Notification.create({
    userId: data.userId,
    content: data.content,
    status: data.status,
    type: data.type,
  });
  return notification;
};

const readAllNotificationOfUser = async (userId) => {
  const notificationNotRead = await Notification.findAll({
    where: {
      userId,
      status: false,
    },
  });
  if (notificationNotRead) {
    _.forEach(notificationNotRead, async (notification) => {
      await notification.update({ status: true });
    });
  }
};

const readNotification = async (id) => {
  const notification = await Notification.findByPk(id);
  if (notification) {
    await notification.update({
      status: true,
    });
  }
  return notification;
};

const getNotification = (userId, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => Notification.findAll({
    where: {
      userId,
    },
    offset: skip,
    limit,
    // include: {
    //   model: Candidate,
    //   // attributes: ['name', 'email', 'phone'],
    // },
    order: [['createdAt', 'DESC']],
  });

  const getCount = () => Notification.count({
    distinct: 'Notification.id',
    where: {
      userId,
    },
  });

  return new Promise(async (resolved, reject) => {
    try {
      let list = await getList();
      let count = await getCount();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getListNotification = (query, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => Notification.findAll({
    offset: skip,
    limit,
    where: query,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
      },
    ],
  });
  const getCount = () => Notification.count({
    where: query,
  });
  return new Promise(async (resolved, reject) => {
    try {
      const list = await getList();
      const count = await getCount();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  createNotification,
  readAllNotificationOfUser,
  readNotification,
  getNotification,
  getListNotification,
};
