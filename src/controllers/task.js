const _ = require('lodash');
const moment = require('moment');
const { forEach } = require('async-foreach');
const taskService = require('../service/task');
const userService = require('../service/user');
const util = require('../common/util');
const { ROLE_LEADER, ROLE_DIRECTOR } = require('../common/util');
const notificationService = require('../service/notification');
const SocketIO = require('../service/socket/socket');

async function addTask(req, res) {
  try {
    let data = req.body;
    let user = await userService.getUserById(data.userId);
    const io = new SocketIO();
    if (!user) {
      return res.status(404).send(util.sendError(404, 'User not found !'));
    }
    let task = await taskService.addTask({
      userId: data.userId,
      content: data.content,
      startDate: moment(data.startDate).format('YYYY-MM-DD 00:00:00'),
      endDate: moment(data.endDate).format('YYYY-MM-DD 00:00:00'),
    });
    // save notification and notify
    const userSendNotification = await userService.getUserById(req.userId);
    const dataNotification = {
      userId: data.userId,
      content: {
        id: task.id,
        title: '', // ${task.content[0].content} ...
        message: `${userSendNotification.name} has added you in a task`,
      },
      type: 'assignTask',
      status: false,
    };
    // console.log(dataNotification)
    const notification = await notificationService.createNotification(dataNotification);
    if (notification) {
      // console.log(`=>`,data.userId, dataNotification)
      await io.sendNotification(data.userId, dataNotification);
    }
    return res.status(201).send(util.sendSuccess({ idTask: task.id }));
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, err));
  }
}

// eslint-disable-next-line consistent-return
async function allTaskTeam(req, res) {
  try {
    const { roleId, userId } = req;
    const { pageSize, pageNumber } = req.query;
    const { startDate, endDate } = req.body;
    let startDateFormat = moment(startDate).format('YYYY-MM-DD 00:00:00');
    let endDateFormat = moment(endDate).format('YYYY-MM-DD 00:00:00');
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) { // role Director
      let { tasks, count } = await taskService.directorGetTaskTeam(
        startDateFormat, endDateFormat, pageNumber, pageSize,
      );
      console.log(count, 'count');
      let arrTaskDirector = [];
      forEach(tasks, async function (item) {
        let done = this.async();
        let obj = {};
        obj.id = item.id;
        obj.userId = item.userId;
        obj.user = await userService.nameAndTeamUser(item.userId);
        obj.content = item.ContentTasks;
        obj.startDate = moment(item.startDate).format('DD/MM/YYYY');
        obj.endDate = moment(item.endDate).format('DD/MM/YYYY');
        arrTaskDirector.push(obj);
        done();
      }, () => res.status(200).send(util.sendSuccess(
        { total: count, tasks: arrTaskDirector },
      )));
    } else if (role.name === ROLE_LEADER) { // role leader
      const users = await userService.getTeamOfUserById(userId);
      const userIds = _.map(users.Team.Users, (user) => user.id);
      let { tasks, count } = await taskService.leaderGetTaskTeam(
        userIds, startDateFormat, endDateFormat, pageNumber, pageSize,
      );
      // console.log('=====================================', tasks.rows[0].ContentTasks);
      let arrTask = [];
      forEach(tasks, async function (item) {
        let done = this.async();
        let obj = {};
        obj.id = item.id;
        obj.userId = item.userId;
        obj.user = await userService.nameAndTeamUser(item.userId);
        obj.content = item.ContentTasks;
        obj.startDate = moment(item.startDate).format('DD/MM/YYYY');
        obj.endDate = moment(item.endDate).format('DD/MM/YYYY');
        arrTask.push(obj);
        done();
      }, () => res.status(200).send(util.sendSuccess({ total: count, tasks: arrTask })));
    } else {
      let user = await userService.getUserById(userId);
      let infoUser = await userService.nameAndTeamUser(user.id);
      let { tasks } = await taskService.leaderGetTaskTeam(
        user.id, startDateFormat, endDateFormat, pageNumber, pageSize,
      );
      let arrTaskMember = tasks.map((item) => {
        let obj = {};
        obj.id = item.id;
        obj.userId = item.userId;
        obj.user = infoUser;
        obj.content = item.ContentTasks;
        obj.startDate = moment(item.startDate).format('DD/MM/YYYY');
        obj.endDate = moment(item.endDate).format('DD/MM/YYYY');
        return obj;
      });

      return res.send(util.sendSuccess({ tasks: arrTaskMember }));
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params; // id task
    const {
      userId,
      content,
      startDate,
      endDate,
    } = req.body;
    const io = new SocketIO();
    // check user trước khi update
    let user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).send(util.sendError(404, 'User not found !'));
    }
    let data = {
      userId,
      content,
      dStart: moment(startDate).format('YYYY-MM-DD 00:00:00'),
      dEnd: moment(endDate).format('YYYY-MM-DD 00:00:00'),
    };
    let task = await taskService.updateTask(id, data);
    if (!task) {
      return res.send(util.sendError(404, 'Task not found !'));
    }
    // save notification and notify
    const userSendNotification = await userService.getUserById(req.userId);
    const dataNotification = {
      userId,
      content: {
        id: task.id,
        title: '', // ${task.content[0].content} ...
        message: `${userSendNotification.name} has updated your in task`,
      },
      type: 'assignTask',
      status: false,
    };
    const notification = await notificationService.createNotification(dataNotification);
    if (notification) {
      await io.sendNotification(data.userId, dataNotification);
    }

    return res.send(util.sendSuccess({ taskId: task.id }));
  } catch (err) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, err));
  }
}

module.exports = {
  addTask,
  allTaskTeam,
  updateTask,
};
