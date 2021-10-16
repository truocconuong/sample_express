const util = require('../common/util');
const bankrecruiterService = require('../service/bankrecruiter');
const userService = require('../service/user');

/**
 * Ham update profile
 * @param {*} req
 * req.body gui len chua :
 * {
 *      userId: "userId",
 *      name:  "name",
 *      email: "email@gmail.com",
 *      Bankrecruiter: {
 *          bankNumber: "bankNumber",
 *          name: "name",
 *          bankName: "bankName",
 *      }
 * }
 * @param {*} res
 * @returns
 */
async function updateRecruiter(req, res) {
  try {
    const data = req.body;
    const { userId } = req;
    const dataBankRecruiter = data.BankRecruiter;

    if (dataBankRecruiter) {
      await bankrecruiterService.updateBankRecruiterByUserId(userId, dataBankRecruiter);
    }

    const user = await userService.updateUser(userId, data);
    if (!user) {
      return res.send(util.sendError(400, 'Not Found User'));
    }
    return res.send(util.sendSuccess({ userId }));
  } catch (error) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function getDetailRecruiter(req, res) {
  try {
    let recruiterId = req.params.id;
    const recruiter = await userService.getDetailRecruiter(recruiterId);
    return res.send(util.sendSuccess({ recruiter }));
  } catch (error) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

module.exports = {
  updateRecruiter,
  getDetailRecruiter,
};
