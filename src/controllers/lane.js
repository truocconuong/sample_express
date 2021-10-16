const laneService = require('../service/lane');
const util = require('../common/util');

async function getListLane(req, res) {
  try {
    const lane = await laneService.getListLane();
    return res.send(util.sendSuccess({ lane }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function addLane(req, res) {
  try {
    const data = {
      nameColumn: req.body.nameColumn,
    };
    const lane = await laneService.insertLane(data);
    return res.send(util.sendSuccess({ nameColumn: lane.nameColumn }));
  } catch (e) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateLane(req, res) {
  try {
    const { laneId } = req.params;
    const data = req.body;

    const lane = await laneService.findById(laneId);
    if (!lane) {
      return res.send(util.sendError('404', 'lane not found'));
    }
    await lane.update(data);
    return res.send(util.sendSuccess());
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function deleteLane(req, res) {
  try {
    const { laneId } = req.params;
    const lane = await laneService.findById(laneId);
    if (!lane) {
      return res.send(util.sendError('404', 'lane not found'));
    }
    await lane.destroy();
    return res.send(util.sendSuccess());
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function detailLane(req, res) {
  try {
    const { laneId } = req.params;

    const lane = await laneService.findById(laneId);
    if (!lane) {
      return res.send(util.sendError('404', 'lane not found'));
    }
    return res.send(util.sendSuccess({ lane }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  addLane,
  updateLane,
  deleteLane,
  getListLane,
  detailLane,
};
