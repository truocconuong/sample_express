const historyService = require('../service/history');
const util = require('../common/util');

async function getHistoryByIdCard(req, res) {
  try {
    const { cardId } = req.body;
    let historyCard = await historyService.getHistoryByIdCard(cardId);
    return res.status(200).send(util.sendSuccess({ historyCard }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function getHistoryByIdJob(req, res) {
  try {
    const { idJob } = req.body;
    let historyJob = await historyService.getHistoryByIdJob(idJob);
    return res.status(200).send(util.sendSuccess({ historyJob }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}
module.exports = {
  getHistoryByIdCard,
  getHistoryByIdJob,
};
