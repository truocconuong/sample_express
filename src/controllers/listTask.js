const util = require('../common/util');
const QueryBuilder = require('../service/builder/QueryBuilder');
const listTaskService = require('../service/listTask');

async function postNewTask(req, res) {
  try {
    const data = req.body;
    const listTask = await listTaskService.postNewTask(data);
    const dataUser = {
      taskId: listTask.id,
      userId: req.userId,
    };
    const taskUser = await listTaskService.assginNewUser(dataUser);
    return res.send(util.sendSuccess({ listTask, taskUser }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function getAllTask(req, res) {
  try {
    const { userId } = req;
    const queryBuilder = new QueryBuilder();
    const { pageSize, pageNumber, status } = req.query;
    queryBuilder.where('status', '!=', 'Done');
    queryBuilder.where('parentId', '=', null);
    if (status) {
      queryBuilder.where('status', '=', `${status}`);
    }
    const query = queryBuilder.generateQuery();

    const data = await listTaskService.getAllTask(pageSize, pageNumber, query, userId);

    return res.send(util.sendSuccess({ data }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function assginNewUser(req, res) {
  try {
    let { taskId } = req.params;

    let data = {
      taskId,
      userId: req.body.userId,
    };

    const checkUser = await listTaskService.checkUserOnTask(data);
    if (checkUser) {
      return res.status(401).send(util.sendError('Duplicate'));
    }
    const user = await listTaskService.assginNewUser(data);
    return res.send(util.sendSuccess({ user }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function postNewSubTask(req, res) {
  try {
    let data = req.body;
    let userData = {
      taskId: data.parentId,
      userId: req.userId,
    };
    let checkUser = await listTaskService.checkUserOnTask(userData);
    if (!checkUser) {
      return res.status(403).send(util.sendError('Forbidden'));
    }

    let subTask = await listTaskService.postNewTask(data);
    const dataUser = {
      taskId: subTask.id,
      userId: req.userId,
    };
    const taskUser = await listTaskService.assginNewUser(dataUser);
    return res.send(util.sendSuccess({ subTask, taskUser }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function getListTaskByParentId(req, res) {
  try {
    let { parentId } = req.params;
    const listTask = await listTaskService.getListTaskByParentId(parentId);
    return res.status(200).send(util.sendSuccess({ listTask }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function deleteTask(req, res) {
  try {
    let { taskId } = req.params;
    const task = await listTaskService.deleteTask(taskId);
    if (!task) {
      return res.status(404).send(util.sendSuccess('Not Found'));
    }
    return res.send(util.sendSuccess(task));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function updateListTask(req, res) {
  try {
    let { taskId } = req.params;
    let data = req.body;
    const task = await listTaskService.updateListTask(taskId, data);
    if (!task) {
      return res.status(404).send(util.sendSuccess('Not Found'));
    }
    return res.send(util.sendSuccess(task));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function deleteAssignUser(req, res) {
  try {
    const { taskId, userId } = req.params;
    let data = {
      taskId,
      userId,
    };
    let idUserPostTask = await listTaskService.checkUserOnTask(data);
    if (!idUserPostTask) {
      return res.status(403).send(util.sendError('Forbidden'));
    }
    let deleteUser = await listTaskService.deleteAssignUser(data);
    if (!deleteUser) {
      return res.status(404).send(util.sendError('Not Found'));
    }
    return res.status(200).send(util.sendSuccess({ deleteUser }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function getTaskById(req, res) {
  try {
    let { taskId } = req.params;
    let listTask = await listTaskService.getTaskById(taskId);
    return res.status(200).send(util.sendSuccess({ listTask }));
  } catch (error) {
    return res
      .status(500)
      .send(util.error(util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

module.exports = {
  postNewTask,
  getAllTask,
  assginNewUser,
  postNewSubTask,
  getListTaskByParentId,
  deleteTask,
  updateListTask,
  deleteAssignUser,
  getTaskById,
};
