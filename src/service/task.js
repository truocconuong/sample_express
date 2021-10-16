const Sequelize = require('sequelize');
const { Task } = require('../../models');
const { ContentTask } = require('../../models');

const { Op } = Sequelize;

const addTask = async (data) => {
  const task = await Task.create({
    userId: data.userId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
  // eslint-disable-next-line array-callback-return
  await data.content.map((c) => {
    try {
      ContentTask.create({
        taskId: task.id,
        content: c.content,
        percent: c.percent,
        target: c.target,
      });
    } catch (er) {
      if (er) {
        throw new Error();
      }
    }
    return c;
  });
  return {
    id: task.id,
    content: data.content[0].content,
  };
};

const leaderGetTaskTeam = (arrUserId, dStart, dEnd, pageNumber, pageSize) => {
  console.log(pageNumber, pageSize);
  let tasks = Task.findAll({
    where: {
      [Op.or]: [
        {
          startDate: {
            [Op.gte]: dStart,
          },
          endDate: {
            [Op.lte]: dEnd,
          },
          userId: arrUserId,
        },
        {
          startDate: {
            [Op.between]: [dStart, dEnd],
          },
          userId: arrUserId,
        },
      ],
    },
    include: {
      model: ContentTask,
    },
    attributes: ['id', 'userId', 'startDate', 'endDate'],

  });
  let count = Task.count({
    where: {
      [Op.or]: [
        {
          startDate: {
            [Op.gte]: dStart,
          },
          endDate: {
            [Op.lte]: dEnd,
          },
          userId: arrUserId,
        },
        {
          startDate: {
            [Op.between]: [dStart, dEnd],
          },
          userId: arrUserId,
        },
      ],
    },
  });
  return new Promise(async (resolve, reject) => {
    try {
      let [tasksData, countData] = await Promise.all([tasks, count]);
      return resolve({ tasks: tasksData, count: countData });
    } catch (error) {
      return reject(error);
    }
  });
};

const directorGetTaskTeam = (dStart, dEnd, pageNumber, pageSize) => {
  console.log(pageSize, pageNumber);
  let tasks = Task.findAll({
    where: {
      [Op.or]: [
        {
          startDate: {
            [Op.gte]: dStart,
          },
          endDate: {
            [Op.lte]: dEnd,
          },
        },
        {
          startDate: {
            [Op.between]: [dStart, dEnd],
          },
        },
      ],
    },
    include: {
      model: ContentTask,
    },
    attributes: ['id', 'userId', 'startDate', 'endDate'],

  });
  let count = Task.count({
    where: {
      [Op.or]: [
        {
          startDate: {
            [Op.gte]: dStart,
          },
          endDate: {
            [Op.lte]: dEnd,
          },
        },
        {
          startDate: {
            [Op.between]: [dStart, dEnd],
          },
        },
      ],
    },

  });
  return new Promise(async (resolve, reject) => {
    try {
      let [tasksData, countData] = await Promise.all([tasks, count]);
      return resolve({ tasks: tasksData, count: countData });
    } catch (error) {
      return reject(error);
    }
  });
};

const updateTask = async (idTask, data) => {
  let task = await Task.findByPk(idTask);
  if (!task) {
    return false;
  }
  console.log(task);
  await ContentTask.destroy({
    where: {
      // criteria
      taskId: idTask,
    },
  });
  task.userId = data.userId;
  task.startDate = data.dStart;
  task.endDate = data.dEnd;
  await task.save();
  // eslint-disable-next-line array-callback-return
  await data.content.map((c) => {
    try {
      ContentTask.create({
        taskId: task.id,
        content: c.content,
        percent: c.percent,
        target: c.target,
      });
    } catch (er) {
      if (er) {
        throw new Error();
      }
    }
    return c;
  });

  return {
    id: idTask,
    content: data.content[0].content,
  };
};

module.exports = {
  addTask,
  leaderGetTaskTeam,
  updateTask,
  directorGetTaskTeam,
};
