const util = require('../common/util');
const caculator = require('../service/caculator-salary/util');

function caculatorSalary(req, res) {
  try {
    const result = caculator(req.body);
    return res.send(util.sendSuccess({ result }));
  } catch (error) {
    console.log(error);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  caculatorSalary,
};
