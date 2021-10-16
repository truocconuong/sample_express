const _ = require('lodash');
const locationService = require('../service/location');
const util = require('../common/util');

async function getAllLocation(req, res) {
  try {
    const locations = await locationService.getAllLocationApply();   
const locationApply = [];
    _.map(locations, (location) => {
      if (!_.isEmpty(location.Jobs)) {
        locationApply.push(location);
      }
      return location;
    });
    return res.send(util.sendSuccess({ location: locationApply }));
 
 } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function postLocation(req, res) {
  try {
    const data = req.body;
    let location = await locationService.postLocation(data);
    return res.send(util.sendSuccess({ location }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    let location = await locationService.updateLocation(id, data);
    if (!location) {
      return res.send(util.sendError(404, 'Location not found !'));
    }
    return res.send(util.sendSuccess({ locationId: location.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function deleteLocation(req, res) {
  try {
    const { id } = req.params;
    let location = await locationService.deleteLocation(id);
    if (!location) {
      return res.send(util.sendError(404, 'Location not found !'));
    }
    return res.send(util.sendSuccess({ locationId: location.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getAllLocation,
  postLocation,
  updateLocation,
  deleteLocation,
};
