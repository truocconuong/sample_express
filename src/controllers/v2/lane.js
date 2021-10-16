const util = require('../../common/util');
const laneService = require('../../service/lane');

async function getAllLane(req, res) {
  try {
    const lanes = await laneService.getListLane();
    return res.send(util.sendSuccess({ list: lanes }));
  } catch (error) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getAllLane,
};
