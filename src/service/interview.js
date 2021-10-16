const Sequelize = require('sequelize');
const {
  Interview, Candidate, CandidateJob, Job, Location,
} = require('../../models');

const { Op } = Sequelize;

const getInterview = (pageSize, pageNumber, query) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => Interview.findAll({
    offset: skip,
    limit,
    order: [['timeInterview', 'DESC']],
    where: query,
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
        },
      ],
      // attributes: ['name', 'email', 'phone'],
    },
  });

  const getCount = () => Interview.count({
    where: query,
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
        },
      ],
      // attributes: ['name', 'email', 'phone'],
    },
  });

  return new Promise(async (resolved, reject) => {
    try {
      let list = await getList();
      let count = await getCount();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const insertInteriew = async (data) => {
  const interview = await Interview.create(data);
  return interview;
};

const updateInteriew = async (id, data) => {
  const interview = await Interview.findByPk(id);
  await interview.update(data);
  return interview;
};

const interviewDetail = async (id) => {
  const interview = await Interview.findByPk(id, {
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
          include: {
            model: Location,
          },
        },
      ],
    },
  });
  return interview;
};

const interviewDelete = async (id) => {
  let interview = await Interview.findByPk(id);
  if (!interview) {
    return false;
  }
  interview.destroy();
  return interview;
};

const checkInterviewTimeExists = async (timeStart, timeEnd, jobId) => {
  const interview = await Interview.findOne({
    where: {
      timeInterviewEnd: {
        [Op.between]: [timeStart, timeEnd],
      },
    },
    include: {
      model: CandidateJob,
      where: {
        jobId,
      },
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
        },
      ],
    },
  });
  return interview;
};

const calendarInterviewMember = (start, end, userId) => {
  const interviews = Interview.findAll({
    where: {
      userId,
      timeInterview: {
        [Op.between]: [start, end],
      },
    },
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
          include: {
            model: Location,
          },
        },
      ],
    },
  });
  return interviews;
};

const calendarInterviewLeader = (start, end, usersTeam) => {
  const interviews = Interview.findAll({
    where: {
      userId: {
        [Op.in]: usersTeam,
      },
      timeInterview: {
        [Op.between]: [start, end],
      },
    },
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
          include: {
            model: Location,
          },
        },
      ],
    },
  });
  return interviews;
};

const getInterviewByCardIds = (pageSize, pageNumber, query) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);

  const getList = () => Interview.findAll({
    where: query,
    offset: skip,
    limit,
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
        },
      ],
      // attributes: ['name', 'email', 'phone'],
    },
    order: [['timeInterview', 'DESC']],
  });

  const getCount = () => Interview.count({
    where: query,
    include: {
      model: CandidateJob,
      include: [
        {
          model: Candidate,
        },
        {
          model: Job,
        },
      ],
      // attributes: ['name', 'email', 'phone'],
    },
  });

  return new Promise(async (resolved, reject) => {
    try {
      let list = await getList();
      let count = await getCount();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

module.exports = {
  getInterview,
  insertInteriew,
  updateInteriew,
  interviewDetail,
  interviewDelete,
  checkInterviewTimeExists,
  calendarInterviewMember,
  calendarInterviewLeader,
  getInterviewByCardIds,
};
