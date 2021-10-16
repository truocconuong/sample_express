const _ = require('lodash');
const moment = require('moment');
const canJobService = require('../candidatejob');

const BONUS_LEVEL_ONE = 500000;
const BONUS_LEVEL_TWO = 1500000;
const BONUS_LEVEL_THREE = 3000000;

// const STATUS_BONUS_ONE = [
//   'Schedule',
//   'Interview online',
//   'Interview F2F',
//   'Onboarding',
//   'Done',
// ];
const STATUS_BONUS_TWO = ['Onboarding', 'Done'];
const STATUS_BONUS_THREE = ['Done'];

function handleCalcBonus(candidateJob) {
  const { Lane, Interview, expectedDate } = candidateJob;
  const listCalc = [];
  let bonus = 0;
  if (Lane) {
    const status = Lane.nameColumn;
    const now = moment();
    // check level 3
    if (_.includes(STATUS_BONUS_THREE, status)) {
      const moneyPlus = now.diff(expectedDate) > 0 ? BONUS_LEVEL_THREE : null;
      if (moneyPlus) {
        bonus += moneyPlus;
        listCalc.push({
          level: 3,
          bonus: BONUS_LEVEL_THREE,
          candidateJobId: candidateJob.id,
        });
      }
    }
    // level 2
    if (_.includes(STATUS_BONUS_TWO, status)) {
      const moneyPlus = now.diff(expectedDate) > 0 ? BONUS_LEVEL_TWO : null;
      if (moneyPlus) {
        bonus += moneyPlus;
        listCalc.push({
          level: 2,
          bonus: moneyPlus,
          candidateJobId: candidateJob.id,
        });
      }
    }
    // level 1
    const moneyPlus = Interview && now.diff(Interview.timeInterview) > 0
      ? BONUS_LEVEL_ONE
      : null;
    if (moneyPlus) {
      bonus += moneyPlus;
      listCalc.push({
        level: 1,
        bonus: moneyPlus,
        candidateJobId: candidateJob.id,
      });
    }
  }
  return {
    listCalc,
    bonus,
  };
}

async function syncCandidateBonusOfRecruiter(recruiterId) {
  const canJobs = await canJobService.getAllCanJobByRecruiter(recruiterId);
  _.map(canJobs, async (candidateJob) => {
    const calcBonus = handleCalcBonus(candidateJob);
    const canJobBonus = candidateJob.CandidateJobBonus;
    /* eslint-disable-next-line no-return-assign, no-param-reassign, max-len */
    const reduceBonus = _.reduce(canJobBonus, (bonus, canBonus) => bonus += Number(canBonus.bonus), 0);
    if (calcBonus.bonus !== reduceBonus) {
      await canJobService.removeAndUpdateBonus(
        candidateJob.id,
        calcBonus.listCalc,
      );
    }
    return canJobs;
  });
}
module.exports = {
  syncCandidateBonusOfRecruiter,
};
