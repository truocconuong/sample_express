const TaskUser = require('../../models');

async function assginNewUser(data) {
  try {
    let taskUser = await TaskUser.create({
      taskid: data.taskId,
      userId: data.userId,
    });
    return taskUser;
  } catch {
    return false;
  }
}

module.exports = { assginNewUser };
