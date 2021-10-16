const moment = require('moment');

const {
  ListTask, TaskUser, User, Role,
} = require('../../models');

async function postNewTask(data) {
  let listTask = await ListTask.create({
    title: data.title,
    content: data.content,
    startDate: moment(data.startDate).add(7, 'h').format('YYYY-MM-DD 00:00:00'),
    dueDate: moment(data.dueDate).add(7, 'h').format('YYYY-MM-DD 00:00:00'),
    status: data.status,
    tag: data.tag,
    parentId: data.parentId,
  });
  return listTask;
}

async function getAllTask(pageSize, pageNumber, query, userId) {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);

  const getList = () => ListTask.findAll({
    offset: skip,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: User,
        attributes: [],
        where: {
          id: userId,
        },
      },
    ],
    where: query,
  });

  const getCount = () => ListTask.count({
    include: [
      {
        model: User,
        attributes: [],
        where: {
          id: userId,
        },
      },
    ],
    where: query,
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
}

async function assginNewUser(data) {
  let taskUser = await TaskUser.create({
    taskId: data.taskId,
    userId: data.userId,
  });
  return taskUser;
}

async function checkUserOnTask(data) {
  let user = await TaskUser.findOne({
    where: {
      taskId: data.taskId,
      userId: data.userId,
    },
  });
  return user;
}

async function findUserCreatedTask(taskId) {
  const getRoleRecruiter = await Role.findOne({
    where: {
      name: 'Director',
    },
  });

  let roleId = getRoleRecruiter.id;
  const user = await TaskUser.findOne({
    include: [
      {
        model: User,
        where: {
          roleId,
        },
        attributes: [],
      },
    ],
    where: {
      taskId,
    },
    attributes: ['userId'],
  });
  return user.userId;
}

async function getListTaskByParentId(parentId) {
  const listTask = await ListTask.findAll({
    where: {
      parentId,
    },
  });
  return listTask;
}

async function getTaskById(taskId) {
  const listTask = await ListTask.findByPk(taskId, {
    include: [
      {
        model: User,
        attributes: ['id', 'roleId', 'teamId', 'email', 'name'],
      },
    ],
  });
  return listTask;
}

async function deleteTaskByParentId(parentId) {
  await ListTask.destroy({
    where: {
      parentId,
    },
  });
  return true;
}

async function deleteTask(taskId) {
  let subTask = await ListTask.findOne({
    where: {
      id: taskId,
    },
  });
  if (!subTask) {
    return false;
  }

  if (!subTask.parentId) {
    await deleteTaskByParentId(taskId);
  }
  await subTask.destroy();
  return true;
}

async function updateListTask(taskId, data) {
  let task = await ListTask.findByPk(taskId);
  await task.update(data);
  return task;
}

async function deleteAssignUser(data) {
  let { taskId } = data;
  let { userId } = data;
  let user = await TaskUser.findOne({
    where: {
      taskId,
      userId,
    },
  });
  if (!user) {
    return false;
  }
  await user.destroy();
  return true;
}

module.exports = {
  postNewTask,
  getAllTask,
  assginNewUser,
  checkUserOnTask,
  findUserCreatedTask,
  getListTaskByParentId,
  deleteTask,
  updateListTask,
  deleteAssignUser,
  getTaskById,
};
