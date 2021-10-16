const _ = require('lodash');
const moment = require('moment');
const notificationService = require('../service/notification');
const util = require('../common/util');
const QueryBuilder = require('../service/builder/QueryBuilder');

async function readAllNotification(req, res) {
  try {
    const { userId } = req;
    const notifications = await notificationService.readAllNotificationOfUser(userId);
    return res.send(util.sendSuccess({ notifications }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function readNotification(req, res) {
  try {
    const { id } = req.params;
    let notification = await notificationService.readNotification(id);
    if (!notification) {
      return res.send(util.sendError(404, 'Notification not found !'));
    }
    return res.send(util.sendSuccess({ notification }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function getAllNotification(req, res) {
  try {
    const { userId } = req;
    const { pageSize, pageNumber } = req.query;
    const notifications = await notificationService.getNotification(userId, pageSize, pageNumber);

    const result = util.sendSuccess(notifications);
    if (!_.isEmpty(notifications)) {
      let totalMessageNotSend = 0;
      const countNotificationNotSeen = _.filter(notifications,
        (notification) => notification.status === false);
      if (countNotificationNotSeen) {
        totalMessageNotSend = countNotificationNotSeen.length;
        result.data.countNotificationNotSeen = totalMessageNotSend;
      }
    }
    return res.send(result);
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getNotifications(req, res) {
  const queryBuilder = new QueryBuilder();
  try {
    let {
      pageSize, pageNumber, userId, type, timeStart, timeEnd,
    } = req.query;
    if (!userId) {
      userId = req.userId;
    }
    if (userId) {
      queryBuilder.where('userId', '=', userId);
    }
    if (type) {
      queryBuilder.where('type', '=', type);
    }

    if (Boolean(timeStart) && Boolean(timeEnd)) {
      const addDaysTimeEnd = moment(timeEnd).add(1, 'days').format('YYYY-MM-DD');
      queryBuilder.where('createdAt', 'between', [timeStart, addDaysTimeEnd]);
    }

    const query = queryBuilder.generateQuery();
    const notification = await notificationService.getListNotification(query, pageSize, pageNumber);
    return res.send(util.sendSuccess(notification));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
module.exports = {
  readAllNotification,
  readNotification,
  getAllNotification,
  getNotifications,
};
