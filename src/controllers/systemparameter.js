const _ = require('lodash');
const systemparameterService = require('../service/systemparameter');
const util = require('../common/util');

async function getAllSystemParameter(req, res) {
  try {
    const result = {};
    let settings = await systemparameterService.getSystems();
    _.map(settings, (setting) => {
      result[setting.key] = setting.value;
    });
    return res.send(util.sendSuccess({ result }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateAllSystems(req, res) {
  try {
    const data = req.body;

    Object.keys(data).forEach(async (key) => {
      await systemparameterService.updateSystem(key, data[key]);
    });

    return res.send(util.sendSuccess());
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getAllSystemParameter,
  updateAllSystems,
};
