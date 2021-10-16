const roleService = require('../service/role');
const util = require('../common/util');

async function getAllRole(req, res) {
  try {
    let roles = await roleService.getAllRole();
    return res.send(util.sendSuccess({ roles }));
  } catch (err) {
    return res
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getAllRole,
};
