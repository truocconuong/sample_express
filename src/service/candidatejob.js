const _ = require('lodash');
const {
  CandidateJobBonus,
  Interview,
  CandidateJob,
  Lane,
  Candidate,
  Job,
  NotificationRecruiter,
} = require('../../models');

const checkBonusOfCanJobByLevel = (candidateJobId, level) => CandidateJobBonus.findOne({
  where: {
    candidateJobId,
    level,
  },
});

const getInterviewByCandidateJobId = (candidateJobId) => Interview.findOne({
  where: {
    cardId: candidateJobId,
  },
});

const createCandidateJobLevel = (data) => CandidateJobBonus.create(data);

const findById = (id) => CandidateJob.findByPk(id, {
  include: Interview,
});

const getAllCanJobByRecruiter = (referalId) => CandidateJob.findAll({
  where: {
    referalId,
  },
  include: [
    {
      model: Lane,
    },
    {
      model: Interview,
    },
    {
      model: CandidateJobBonus,
    },
    {
      model: Candidate,
    },
    {
      model: Job,
    },
  ],
});

const removeAndUpdateBonus = async (candidateJobId, listBonus) => {
  const allBonusOld = await CandidateJobBonus.findAll({
    where: {
      candidateJobId,
    },
  });
  _.map(allBonusOld, async (bonus) => {
    await bonus.destroy();
    return bonus;
  });

  _.map(listBonus, async (bonus) => {
    await CandidateJobBonus.create(bonus);
    return bonus;
  });
  return allBonusOld;
};

const getAllNotificationRecruiter = async () => NotificationRecruiter.findAll({
  where: {
    status: false,
  },
});
module.exports = {
  checkBonusOfCanJobByLevel,
  getInterviewByCandidateJobId,
  createCandidateJobLevel,
  findById,
  getAllCanJobByRecruiter,
  removeAndUpdateBonus,
  getAllNotificationRecruiter,
};
