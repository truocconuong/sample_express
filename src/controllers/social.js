const { forEach } = require('async-foreach');
const util = require('../common/util');
const socialService = require('../service/social/social');

// eslint-disable-next-line consistent-return
async function candidateSocial(req, res) {
  try {
    let { items } = req.body;
    let id = await socialService.getIdRequestSignHire({ items });
    if (!id) {
      return res.send(util.sendError(401, 'Authentication'));
    }
    let data = await socialService.checkRequest(id);
    let arrayResult = [];
    forEach(items, (item) => {
      arrayResult.push(data[item]);
    });
    let result = [];
    console.log(arrayResult);
    forEach(arrayResult, async function (candidate) {
      let done = this.async();
      if (candidate && candidate.status === 'success') {
        let obj = await socialService.getCandidateSingHire(candidate.uid);
        result.push(obj);
      }
      done();
    }, () => res.status(200).send(util.sendSuccess({ data: result })));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  candidateSocial,
};
