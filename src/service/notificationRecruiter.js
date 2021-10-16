const { NotificationRecruiter } = require('../../models');

const createNotiRecruiter = (data) => NotificationRecruiter.create(data);

module.exports = {
  createNotiRecruiter,
};
