/* eslint-disable array-callback-return */
const Sequelize = require('sequelize');
const { nanoid } = require('nanoid');
const slug = require('slug');
const _ = require('lodash');
const bitly = require('./bitly');
const config = require('../../config');

const {
  Job,
  JobSkill,
  UserJob,
  Skill,
  Location,
  Client,
  User,
  Candidate,
  CandidateJob,
  Role,
  Tag,
  JobTag,
  Lane,
} = require('../../models');
const models = require('../../models');

const { Op } = Sequelize;

// eslint-disable-next-line consistent-return
const postJob = async (data) => {
  let t;
  try {
    t = await models.sequelize.transaction();
    const job = await Job.create(
      {
        title: data.title,
        content: data.content,
        locationId: data.locationId,
        jobStatus: data.jobStatus,
        type: data.type,
        salary: data.salary,
        slug: data.slug,
        time: data.time,
        keyword: data.keyword,
        note: data.note,
        descJob: data.descJob,
        interviewProcess: data.interviewProcess,
        extraBenefit: data.extraBenefit,
        aboutFetch: data.aboutFetch,
        clientId: data.clientId,
        responsibilities: data.responsibilities,
        requirement: data.requirement,
        niceToHave: data.niceToHave,
        benefit: data.benefit,
        metaJob: data.metaJob,
        titlePage: data.titlePage,
      },
      { transaction: t },
    );
    if (!job) {
      throw new Error();
    }
    let codeBitly = nanoid(10);
    let slugJob = `${slug(job.title)}-${codeBitly}-${job.id}`;
    let urlLong = `${config.app.linkFetchTech}${slugJob}`;
    let url = await bitly.genUrlShort(urlLong);

    UserJob.create({
      userId: data.userId,
      jobId: job.id,
      isDelete: false,
      isFirst: true,
      codeBitly,
      idUrlShort: url.id,
      urlShort: url.link,
    });
    let skills = data.skill ? data.skill : [];
    if (skills.length > 0) {
      await skills.map((skill) => {
        try {
          JobSkill.create({
            jobId: job.id,
            skillId: skill.id,
            isRequired: skill.isRequired,
          });
        } catch (er) {
          if (er) {
            throw new Error();
          }
        }
      });
    }
    await t.commit();
    return new Promise(async (resolved, reject) => {
      try {
        return resolved(job);
      } catch (error) {
        return reject(error);
      }
    });
  } catch (err) {
    await t.rollback();
    console.log(err);
  }
};

const getAllJobActive = async (query) => {
  let queryWhere = {
    jobStatus: 'Active',
  };
  if (query) {
    queryWhere = query;
  }
  let jobs = await Job.findAll({
    where: queryWhere,
    include: [
      {
        model: Location,
        attributes: ['office'],
      },
      {
        model: Skill,
      },
      {
        model: Tag,
      },
    ],
    attributes: [
      'id',
      'title',
      'slug',
      'content',
      'locationId',
      'salary',
      'type',
      'description',
      'externalRecruiter',
    ],
    order: [['createdAt', 'DESC']],
  });
  return jobs;
};

const getDetailJobToSlug = async (slugJob) => {
  let jobDetail = await Job.findAll({
    where: {
      slug: slugJob,
      jobStatus: 'Active',
    },
    include: [
      {
        model: Skill,
        attributes: ['id', 'name'],
      },
      {
        model: Location,
        attributes: ['id', 'name'],
      },
      {
        model: Client,
        attributes: ['id', 'name', 'about'],
      },
    ],
  });
  return jobDetail;
};

const getJobToLocation = async (query) => {
  let queryWhere = {
    jobStatus: 'Active',
  };
  if (query) {
    queryWhere = query;
  }
  let jobs = Job.findAll({
    where: queryWhere,
    include: [
      {
        model: Location,
        attributes: ['office'],
      },
      {
        model: Skill,
      },
      {
        model: Tag,
      },
    ],
    attributes: [
      'id',
      'title',
      'slug',
      'content',
      'locationId',
      'salary',
      'type',
      'description',
      'externalRecruiter',
    ],
    order: [['createdAt', 'DESC']],
  });
  return jobs;
};

const getJobRelation = async (slugJob) => {
  let jobs = Job.findAll({
    where: {
      slug: {
        [Op.ne]: slugJob,
      },
      jobStatus: 'Active',
    },
    attributes: [
      'id',
      'title',
      'slug',
      'content',
      'locationId',
      'salary',
      'type',
    ],
    limit: 3,
  });
  return jobs;
};
const getListJobAdmin = (pageSize, pageNumber, status, title) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let filter = title ? { title: { [Op.like]: `%${title}%` } } : {};
  if (status !== 'All') {
    filter.jobStatus = status;
  }
  let getListJob = () => Job.findAll({
    where: filter,
    attributes: ['id', 'title', 'salary', 'type', 'jobStatus', 'time'],
    limit,
    offset: skip,
    include: [
      {
        model: Location,
        attributes: ['id', 'name'],
      },
      {
        model: Client,
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  let getCountJob = () => Job.count({
    where: filter,
  });
  return new Promise(async (resolved, reject) => {
    // code xưa hơi tù, hehe
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getDetailJob = async (id) => {
  let jobDetail = Job.findByPk(id, {
    include: [
      {
        model: Skill,
        attributes: ['id', 'name'],
      },
      {
        model: Client,
        attributes: ['id', 'name', 'about', 'token'],
      },
      {
        model: Location,
        attributes: ['id', 'name'],
      },
      {
        model: User,
        attributes: ['id', 'name'],
      },
      {
        model: Tag,
        attributes: ['id', 'title'],
      },
    ],
  });
  console.log(jobDetail);
  return jobDetail;
};
const getDetailJobRaw = async (id) => {
  let jobDetail = Job.findByPk(id, {
    raw: true,
    include: [
      {
        model: Skill,
        attributes: ['id', 'name'],
      },
      {
        model: Client,
        attributes: ['id', 'name', 'about'],
      },
      {
        model: Location,
        attributes: ['id', 'name'],
      },
      {
        model: User,
        attributes: ['id', 'name'],
      },
    ],
  });
  return jobDetail;
};

const updateActiveJob = async (jobStatus, id) => {
  const job = await Job.findByPk(id);
  if (!job) {
    return false;
  }
  job.jobStatus = jobStatus;
  await job.save(); // new info job
  return job;
};

// eslint-disable-next-line consistent-return
const updateJob = async (data, id) => {
  try {
    const job = await Job.findByPk(id);
    if (!job) {
      return false;
    }
    job.title = data.title;
    job.content = data.content;
    job.locationId = data.locationId;
    job.jobStatus = data.jobStatus;
    job.type = data.type;
    job.salary = data.salary;
    job.slug = data.slug;
    job.time = data.time;
    job.keyword = data.keyword;
    job.note = data.note;
    job.descJob = data.descJob;
    job.interviewProcess = data.interviewProcess;
    job.extraBenefit = data.extraBenefit;
    job.aboutFetch = data.aboutFetch;
    job.clientId = data.clientId;
    job.responsibilities = data.responsibilities;
    job.requirement = data.requirement;
    job.niceToHave = data.niceToHave;
    job.benefit = data.benefit;
    job.metaJob = data.metaJob;
    job.titlePage = data.titlePage;
    job.description = data.description;
    job.externalRecruiter = data.externalRecruiter;

    await job.save(); // new info job

    let skills = data.skill ? data.skill : []; // handle skill of job
    if (skills.length > 0) {
      await JobSkill.destroy({
        where: {
          jobId: job.id,
        },
      });
      await skills.map((skill) => {
        try {
          JobSkill.create({
            jobId: job.id,
            skillId: skill.id,
            isRequired: skill.isRequired,
          });
        } catch (er) {
          if (er) {
            throw new Error();
          }
        }
      });
    } else {
      await JobSkill.destroy({
        where: {
          jobId: job.id,
        },
      });
    }
    return job;
  } catch (err) {
    console.log(err);
  }
};

const deleteJob = async (id) => {
  const job = await Job.findByPk(id);
  if (!job) {
    return false;
  }
  job.destroy();
  return job;
};
const getListJobSearch = async () => {
  let listJob = await Job.findAll({
    attributes: ['id', 'title'],
  });
  return listJob;
};

const getListJobDashBoard = async (
  pageSize,
  pageNumber,
  status,
  startDate,
  endDate,
) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let filter = { jobStatus: status };
  if (startDate && endDate) {
    filter = {
      jobStatus: status,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
  }
  let getListJob = () => UserJob.findAll({
    where: {
      isFirst: true,
      isDelete: false,
    },
    attributes: ['id', 'userId'],
    limit,
    offset: skip,
    include: [
      {
        model: Job,
        attributes: ['id', 'title', 'salary', 'type', 'jobStatus', 'clientId'],
        where: filter,
        include: [
          {
            model: CandidateJob,
            attributes: ['id'],
          },
          {
            model: Client,
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      },
    ],
  });
  let getCountJob = () => UserJob.count({
    where: {
      isFirst: true,
      isDelete: false,
    },
    include: [
      {
        model: Job,
        where: filter,
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const leaderGetListJobDashBoard = async (
  userId,
  pageSize,
  pageNumber,
  status,
  startDate,
  endDate,
) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let filter = { jobStatus: status };
  if (startDate && endDate) {
    filter = {
      jobStatus: status,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
  }
  console.log('===>', filter);
  let getListJob = () => UserJob.findAll({
    where: {
      userId,
      isDelete: false,
    },
    attributes: ['id'],
    limit,
    offset: skip,
    include: [
      {
        model: Job,
        attributes: ['id', 'title', 'salary', 'type', 'jobStatus', 'clientId'],
        where: filter,
        include: [
          {
            model: CandidateJob,
            attributes: ['id'],
          },
          {
            model: Client,
            attributes: ['id', 'name'],
          },
        ],
        order: [['createdAt', 'DESC']],
      },
    ],
  });
  let getCountJob = () => UserJob.count({
    where: {
      userId,
      isDelete: false,
    },
    include: [
      {
        model: Job,
        where: filter,
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const memberGetListJobDashBoard = (
  userId,
  pageSize,
  pageNumber,
  status,
  startDate,
  endDate,
) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let filter = { jobStatus: status };
  if (startDate && endDate) {
    filter = {
      jobStatus: status,
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
  }
  let getListJob = () => UserJob.findAll({
    where: {
      userId,
      isDelete: false,
    },
    attributes: ['id'],
    limit,
    offset: skip,
    include: [
      {
        model: Job,
        attributes: ['id', 'title', 'salary', 'type', 'jobStatus', 'clientId'],
        where: filter,
        include: [
          {
            model: CandidateJob,
            attributes: ['id'],
          },
          {
            model: Client,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  });
  let getCountJob = () => UserJob.count({
    where: {
      userId,
      isDelete: false,
    },
    include: [
      {
        model: Job,
        where: filter,
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getJobActiveTrello = async () => {
  let jobs = await Job.findAll({
    where: {
      jobStatus: 'Active',
    },
    attributes: ['id', 'title'],
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Client,
        attributes: ['name'],
      },
      {
        model: Location,
        attributes: ['name'],
      },
    ],
  });
  return jobs;
};

const checkJob = (id) => Job.findByPk(id, {
  attributes: ['id', 'title', 'folderId'],
});

const checkAssignUser = (userId, jobId) => {
  let data = UserJob.findOne({
    where: {
      userId,
      jobId,
      isDelete: false,
    },
  });
  return data;
};

const updateDeleteAssignUser = async (userId, jobId) => {
  let data = await UserJob.update(
    {
      isDelete: true,
    },
    {
      where: {
        userId,
        jobId,
        isDelete: false,
      },
    },
  );
  return data;
};

const assignUserJob = (userId, jobId, idUrl, url, codeBitly) => UserJob.create({
  userId,
  jobId,
  isDelete: false,
  idUrlShort: idUrl,
  urlShort: url,
  codeBitly,
});

const menberGetAssignUserJob = async (userId, jobId) => {
  let data = await UserJob.findAll({
    where: {
      userId,
      jobId,
      isDelete: false,
    },
    include: [
      {
        model: User,
        attributes: ['name', 'linkAvatar'],
      },
    ],
    attributes: [
      'id',
      'userId',
      'jobId',
      'idUrlShort',
      'urlShort',
      'isFirst',
      'numberCandidate',
    ],
  });
  return data;
};

const getAssignUserJob = async (jobId) => {
  let data = await UserJob.findAll({
    where: {
      jobId,
      isDelete: false,
    },
    include: [
      {
        model: User,
        attributes: ['name', 'linkAvatar'],
      },
    ],
    attributes: [
      'id',
      'userId',
      'jobId',
      'idUrlShort',
      'urlShort',
      'isFirst',
      'numberCandidate',
    ],
  });
  return data;
};
const getAssignUserJobNoti = async (jobId, idMember, roleIdLeader) => {
  let data = await UserJob.findAll({
    where: {
      jobId,
      isDelete: false,
      [Op.or]: {
        userId: idMember,
        '$User.roleId$': [roleIdLeader],
      },
    },
    include: [
      {
        model: User,
        attributes: ['name', 'linkAvatar'],
      },
    ],
    attributes: [
      'id',
      'userId',
      'jobId',
      'idUrlShort',
      'urlShort',
      'numberCandidate',
    ],
  });
  return data;
};
const memberGetJobAssign = (userId, pageNumber, pageSize) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let getListJob = () => Job.findAll({
    where: {
      jobStatus: 'Active',
    },
    attributes: ['id', 'title', 'salary', 'type', 'jobStatus'],
    limit,
    offset: skip,
    include: [
      {
        model: Candidate,
        attributes: ['id'],
      },
      {
        model: User,
        where: {
          id: userId,
        },
        attributes: ['id'],
      },
    ],
  });
  let getCountJob = () => Job.count({
    distinct: 'Job.id',
    where: {
      jobStatus: 'Active',
    },
    include: [
      {
        model: User,
        where: {
          id: userId,
        },
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const leaderGetJobAssign = (idTeam, pageNumber, pageSize) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let getListJob = () => Job.findAll({
    where: {
      jobStatus: 'Active',
    },
    attributes: ['id', 'title', 'salary', 'type', 'jobStatus'],
    limit,
    offset: skip,
    include: [
      {
        model: Candidate,
        attributes: ['id'],
      },
      {
        model: User,
        where: {
          teamId: idTeam,
        },
        attributes: ['id'],
      },
    ],
  });
  let getCountJob = () => Job.count({
    distinct: 'Job.id',
    where: {
      jobStatus: 'Active',
    },
    include: [
      {
        model: User,
        where: {
          teamId: idTeam,
        },
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const directorGetJobAssign = (pageNumber, pageSize) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let getListJob = () => Job.findAll({
    where: {
      jobStatus: 'Active',
    },
    attributes: ['id', 'title', 'salary', 'type', 'jobStatus'],
    limit,
    offset: skip,
    include: [
      {
        model: Candidate,
        attributes: ['id'],
      },
    ],
  });
  let getCountJob = () => Job.count({
    distinct: 'Job.id',
    where: {
      jobStatus: 'Active',
    },
  });
  return new Promise(async (resolved, reject) => {
    try {
      let list = await getListJob();
      let count = await getCountJob();
      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getDetailJobByName = (name) => {
  const job = Job.findOne({
    where: {
      title: name,
    },
  });
  return job;
};

const insertJobCandidate = (data) => {
  const jobCandidate = CandidateJob.create({
    candidateId: data.candidateId,
    jobId: data.jobId,
  });
  return jobCandidate;
};

const getDetailJobToId = async (id) => {
  let jobDetail = await Job.findOne({
    where: {
      id,
      jobStatus: 'Active',
    },
    include: [
      {
        model: Skill,
        attributes: ['id', 'name'],
      },
      {
        model: Location,
        attributes: ['id', 'name', 'linkMap', 'address', 'descLocation'],
      },
      {
        model: Client,
        attributes: ['id', 'name', 'about'],
      },
      {
        model: Tag,
      },
    ],
  });
  return jobDetail;
};

const getJobRelationToId = async (id) => {
  let jobs = Job.findAll({
    where: {
      id: {
        [Op.ne]: id,
      },
      jobStatus: 'Active',
    },
    include: [
      {
        model: Location,
        attributes: ['office'],
      },
    ],
    attributes: [
      'id',
      'title',
      'slug',
      'content',
      'jobStatus',
      'locationId',
      'salary',
      'type',
      'externalRecruiter',
    ],
    order: Sequelize.literal('rand()'),
    limit: 3,
  });
  return jobs;
};

const countJobActiveById = (jobId) => UserJob.count({
  where: {
    jobId,
    isDelete: false,
  },
});

const leaderClearAssign = (jobId) => UserJob.update(
  {
    isDelete: true,
  },
  {
    where: {
      jobId,
      isDelete: false,
    },
  },
);

const leaderAssignLeader = (userId, jobId, idUrl, url, codeBitly) => UserJob.create({
  userId,
  jobId,
  codeBitly,
  idUrlShort: idUrl,
  urlShort: url,
  isDelete: false,
  isFirst: true,
});

const notificationJob = async () => Job.findAll({
  // tìm job active
  where: {
    jobStatus: 'Active',
  },
  attributes: ['id', 'title', 'time'],
  include: [
    // tìm người tạo job thỏa mãn điều kiện: role leader + isDelete false
    {
      model: UserJob,
      where: {
        isDelete: false,
      },
      attributes: ['id', 'userId', 'jobId'],
      include: [
        {
          model: User,
          attributes: ['id'],
          where: {
            roleId: '4cfbcf03-7f25-4c44-abb2-712ac449583d',
            isDelete: false,
          },
        },
      ],
    },
  ],
});

const getAllJobByClient = (clientId) => Job.findAll({
  where: {
    clientId,
  },
  include: [
    {
      model: CandidateJob,
      include: [
        {
          model: Lane,
          where: {
            nameColumn: {
              [Op.in]: ['Screen CV', 'Schedule', 'Interview online', 'Testing', 'Considering', 'Interview F2F'],
            },
          },
        }, {
          model: Candidate,
        },
      ],
    },
  ],
});

const verifyJob = (clientId, jobId) => Job.findOne({
  where: {
    clientId,
    id: jobId,
  },
});
const getAllUserOfJob = (jobId) => Job.findByPk(jobId, {
  include: {
    model: User,
    include: {
      model: Role,
      where: {
        name: 'Leader',
      },
    },
  },
});

const updateTagForJob = async (jobId, tags) => {
  const getAllTagOfJob = await JobTag.findAll({
    where: {
      jobId,
    },
  });
  // destroy all
  _.map(getAllTagOfJob, async (tagDetail) => {
    await tagDetail.destroy();
    return tagDetail;
  });

  // createAgain

  _.map(tags, async (tag) => {
    await JobTag.create({
      jobId,
      tagId: tag,
    });
    return tag;
  });
};

const getAllJobShareRecruiter = () => Job.findAll({
  include: [
    {
      model: Tag,
    },
    {
      model: Location,
    },
  ],
  where: {
    externalRecruiter: true,
  },
});

module.exports = {
  postJob,
  getAllJobActive,
  getDetailJobToSlug,
  getJobToLocation,
  getJobRelation,
  getListJobAdmin,
  getDetailJob,
  updateActiveJob,
  updateJob,
  deleteJob,
  getListJobDashBoard,
  getJobActiveTrello,
  leaderGetListJobDashBoard,
  memberGetListJobDashBoard,
  checkJob,
  checkAssignUser,
  updateDeleteAssignUser,
  assignUserJob,
  menberGetAssignUserJob,
  getAssignUserJob,
  getAssignUserJobNoti,
  memberGetJobAssign,
  leaderGetJobAssign,
  directorGetJobAssign,
  getDetailJobByName,
  insertJobCandidate,
  getDetailJobToId,
  getJobRelationToId,
  countJobActiveById,
  leaderClearAssign,
  leaderAssignLeader,
  notificationJob,
  getListJobSearch,
  getDetailJobRaw,
  getAllJobByClient,
  verifyJob,
  getAllUserOfJob,
  updateTagForJob,
  getAllJobShareRecruiter,
};
