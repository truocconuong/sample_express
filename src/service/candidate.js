const Sequelize = require('sequelize');
const {
  Candidate,
  Job,
  Location,
  CandidateJob,
  Client,
  Lane,
  UserJob,
  CardUser,
  User,
  Interview,
  CandidateJobBonus,
  BankRecruiter,
} = require('../../models');

const { Op } = Sequelize;

// eslint-disable-next-line consistent-return
const insertCandidate = async (data) => {
  try {
    let candidate = await Candidate.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      skill: data.skill,
      message: data.message,
    });
    if (!data.idJob) {
      throw new Error();
    } else {
      console.log({
        candidateId: candidate.id,
        jobId: data.idJob,
        linkPortfolio: data.linkPortfolio,
        cv: data.cv,
        isAddCard: false,
        laneId: null,
        source: data.codeBitly,
        userCreate: data.userCreate,
        referalId: data.referalId,
      });
      await CandidateJob.create({
        candidateId: candidate.id,
        jobId: data.idJob,
        linkPortfolio: data.linkPortfolio,
        cv: data.cv,
        isAddCard: false,
        laneId: null,
        source: data.codeBitly,
        userCreate: data.userCreate,
        referalId: data.referalId,
      });
    }
    return candidate;
  } catch (err) {
    console.log(err);
    if (err) {
      throw new Error();
    }
  }
};

// ứng viên đã apply trước đó

// eslint-disable-next-line consistent-return
const candidateHasList = async (
  idCandidate,
  idJob,
  cv,
  linkPortfolio,
  codeBitly,
  userCreate,
) => {
  try {
    let candidate = await Candidate.findByPk(idCandidate);
    await CandidateJob.create({
      cv,
      candidateId: idCandidate,
      jobId: idJob,
      linkPortfolio,
      isAddCard: false,
      laneId: null,
      source: codeBitly,
      userCreate,
    });
    return candidate;
  } catch (err) {
    if (err) {
      throw new Error();
    }
  }
  return true;
};

const getCandidate = (pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => Candidate.findAll({
    offset: skip,
    limit,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Location,
            attributes: ['name'],
          },
        ],
      },
    ],
  });

  const getCount = () => Candidate.count();

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

const getCandidateAdminDetail = async (id) => {
  let candidate = await Candidate.findByPk(id, {
    include: [
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Client,
            attributes: ['id', 'name'],
          },
          {
            model: Location,
            attributes: ['name'],
          },
        ],
      },
    ],
  });
  return candidate;
};

const getCandidateToJob = async (idJob) => {
  const data = CandidateJob.findAll({
    where: {
      jobId: idJob,
    },
    include: [
      {
        model: Job,
        attributes: ['title'],
      },
      {
        model: Candidate,
        attributes: ['name'],
      },
      {
        model: Lane,
        attributes: ['id', 'nameColumn', 'background'],
      },
      {
        model: User,
        attributes: ['name'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  return data;
};
const getCandidateToJobMember = async (idJob, idUser, bitlyCode) => {
  const data = CandidateJob.findAll({
    where: {
      jobId: idJob,
      [Op.or]: {
        '$CardUsers.userId$': idUser,
        source: bitlyCode,
      },
    },
    include: [
      {
        model: CardUser,
      },
      {
        model: Candidate,
        attributes: ['name'],
      },
      {
        model: Lane,
        attributes: ['id', 'nameColumn', 'background'],
      },
      {
        model: User,
        attributes: ['name'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
  return data;
};
const getCandidateInterview = (idJob) => Job.findByPk(idJob, {
  attributes: ['title'],
  include: [
    {
      model: Candidate,
      attributes: ['id', 'email', 'phone'],
      order: [['createdAt', 'DESC']],
    },
    {
      model: Location,
      attributes: ['address'],
    },
  ],
});

const checkCandidate = (email, phone) => {
  const candidate = Candidate.findOne({
    where: {
      [Op.or]: [
        {
          email,
        },
        {
          phone,
        },
      ],
    },
  });
  return candidate;
};

const insertCandidateFromCard = (data) => {
  const candidate = Candidate.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    cv: data.cv,
    location: data.location,
    approachDate: data.approachDate,
    nameJob: data.nameJob,
  });
  return candidate;
};

const getCandidateAddCard = (id, idJob, idCandidateJob) => CandidateJob.findOne({
  where: {
    id: idCandidateJob,
    jobId: idJob,
    candidateId: id,
  },
  include: [
    {
      model: Candidate,
      attributes: ['name', 'email', 'phone'],
    },
    {
      model: Job,
      attributes: ['title'],
      include: [
        {
          model: Location,
          attributes: ['name'],
        },
        {
          model: Client,
          attributes: ['name'],
        },
      ],
    },
  ],
});

const getCandidateByJob = (idJobs, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => CandidateJob.findAll({
    offset: skip,
    limit,
    order: [['createdAt', 'DESC']],
    where: {
      jobId: {
        [Op.in]: idJobs,
      },
    },
    include: [
      {
        model: Job,
        include: [
          {
            model: Location,
            attributes: ['name'],
          },
          {
            model: Client,
            attributes: ['name'],
          },
        ],
      },
      {
        model: Candidate,
      },
    ],
  });
  const getCount = () => CandidateJob.count({
    distinct: 'CandidateJob.id',
    where: {
      jobId: {
        [Op.in]: idJobs,
      },
    },
    include: [
      {
        model: Job,
      },
      {
        model: Candidate,
      },
    ],
  });
  return new Promise(async (resolved, reject) => {
    try {
      const list = await getList();
      const count = await getCount();

      return resolved({ total: count, list });
    } catch (error) {
      return reject(error);
    }
  });
};

const getCandidatePopup = (id) => CandidateJob.findByPk(id, {
  include: [
    {
      model: Candidate,
      attributes: ['name', 'email', 'phone'],
    },
    {
      model: Job,
      attributes: ['title', 'folderId'],
      include: [
        {
          model: Location,
          attributes: ['name'],
        },
        {
          model: Client,
          attributes: ['name'],
        },
      ],
    },
  ],
});

const insertCandidateCard = async (data) => {
  let candidate;
  try {
    candidate = await Candidate.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      skill: data.skill,
      location: data.location,
      facebook: data.facebook,
      linkedin: data.linkedin,
      skype: data.skype,
      source: 'system',
    });
    return candidate;
  } catch (err) {
    if (err) {
      throw new Error();
    }
  }
  return candidate;
};

const updateOfCreateCandidateJob = async (data) => {
  let candidateJob;
  candidateJob = await CandidateJob.findOne({
    where: {
      candidateId: data.candidateId,
      jobId: data.jobId,
    },
  });
  if (!candidateJob) {
    candidateJob = await CandidateJob.create(data);
  } else if (candidateJob.isAddCard) {
    return false;
  }
  await candidateJob.update(data);
  return candidateJob;
};

const checkCodeBitlyCandidate = async (codeBitly) => UserJob.findOne({
  where: {
    codeBitly,
  },
});

const updateBitlyCandidate = async (id) => {
  let data = await UserJob.findByPk(id);
  await data.update({
    numberCandidate: data.numberCandidate + 1,
  });
  return data;
};

const updateParserPdfCandidateJob = async (id, jobId, data) => {
  const result = await CandidateJob.findOne({
    where: {
      candidateId: id,
      jobId,
    },
  });
  await result.update({
    parserPdf: data.parserPdf,
    dataParserPdf: data.dataParserPdf,
    isRefinePdf: data.isRefinePdf,
  });
  return result;
};

const getCandidateJob = async (candidateId, jobId) => {
  const candidateJob = CandidateJob.findOne({
    where: {
      candidateId,
      jobId,
    },
    include: {
      model: Candidate,
    },
  });
  return candidateJob;
};

const getCandidateByEmail = async (email) => {
  const candidate = Candidate.findAll({
    where: {
      email: {
        [Op.like]: `${email}%`,
      },
    },
    limit: 20,
    attributes: ['id', 'name', 'email', 'phone'],
  });
  return candidate;
};

const getCandidateByPhone = async (phone) => {
  const candidate = Candidate.findAll({
    where: {
      phone: {
        [Op.like]: `${phone}%`,
      },
    },
    attributes: ['id', 'name', 'email', 'phone'],
    limit: 10,
  });
  return candidate;
};

const getCandidateSearch = (pageSize, pageNumber, query, jobId) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let includeFilterJob = jobId
    ? [
      {
        model: CandidateJob,
        where: {
          jobId,
        },
        include: [
          {
            model: Lane,
            attributes: ['nameColumn', 'background'],
          },
          {
            model: Job,
            attributes: ['id', 'title'],
          },
          {
            model: User,
            attributes: ['name'],
          },
        ],
        attributes: ['id', 'source', 'isAddCard', 'createdAt'],
      },
    ]
    : [
      {
        model: CandidateJob,
        include: [
          {
            model: Lane,
            attributes: ['nameColumn', 'background'],
          },
          {
            model: Job,
            attributes: ['id', 'title'],
          },
          {
            model: User,
            attributes: ['name'],
          },
        ],
        attributes: ['id', 'source', 'isAddCard', 'createdAt'],
      },
    ];

  let filterJobCount = jobId ? [{ model: CandidateJob, where: { jobId } }] : [];

  let getList = () => Candidate.findAll({
    offset: skip,
    limit,
    where: query,
    order: [['createdAt', 'DESC']],
    include: includeFilterJob,
    attributes: ['id', 'name', 'email', 'phone', 'createdAt'],
  });

  let getCount = () => Candidate.count({
    where: query,
    include: filterJobCount,
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

const check = () => {
  const result = Candidate.findAll({
    where: {
      name: {
        [Op.like]: '[TEST]%',
      },
    },
    include: {
      model: CandidateJob,
      include: {
        model: CardUser,
      },
    },
  });
  return result;
};

const checkExist = async (email, phone, jobId) => {
  let result = false;
  const candidate = await Candidate.findOne({
    where: {
      [Op.or]: {
        email,
        phone,
      },
    },
    include: {
      model: CandidateJob,
      where: {
        jobId,
      },
    },
  });
  console.log(candidate);
  if (candidate) {
    result = true;
  }
  return result;
};

const updateCandidate = async (id, data) => {
  const candidate = await Candidate.findByPk(id);
  await candidate.update(data);
};

const updateCandidateJob = async (id, data) => {
  const candidateJob = await CandidateJob.findByPk(id);
  if (candidateJob) {
    await candidateJob.update(data);
  }
  return candidateJob;
};

const checkCandidateAndSocial = (email, phone, facebook, linkedin, skype) => {
  const candidate = Candidate.findOne({
    where: {
      [Op.or]: [
        {
          email,
        },
        {
          phone,
        },
        {
          facebook,
        },
        {
          linkedin,
        },
        {
          skype,
        },
      ],
    },
  });
  return candidate;
};

const checkAllCandidateExists = (email, phone, facebook, linkedin, skype) => {
  const candidate = Candidate.findAll({
    where: {
      [Op.or]: [
        {
          email,
        },
        {
          phone,
        },
        {
          facebook,
        },
        {
          linkedin,
        },
        {
          skype,
        },
      ],
    },
  });
  return candidate;
};

const getAllCandidateOfRecruiter = async (referalId) => {
  const candidates = await CandidateJob.findAll({
    where: {
      referalId,
    },
    include: [
      { model: Candidate },
      {
        model: Lane,
      },
      {
        model: Job,
      },
    ],
  });
  return candidates;
};

const getDetailProfileOfRecruiter = async (id) => {
  const recruiter = await User.findByPk(id, {
    include: [
      {
        model: BankRecruiter,
      },
      {
        model: CandidateJob,
      },
    ],
  });
  return recruiter;
};

const getAllCandidateRecruiter = async (referalId) => {
  const candidates = await CandidateJob.findAll({
    where: {
      referalId,
    },
    include: [
      {
        model: Candidate,
      },
      {
        model: CandidateJobBonus,
      },
      {
        model: Lane,
      },
      {
        model: Job,
      },
    ],
  });
  return candidates;
};

const getAllCandidateOfRecruiterByJob = async (
  condition,
  pageSize,
  pageNumber,
) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => CandidateJob.findAll({
    offset: skip,
    limit,
    where: condition,
    include: [
      { model: Candidate },
      {
        model: Lane,
      },
      {
        model: Job,
      },
      {
        model: CandidateJobBonus,
      },
    ],
  });

  const getCount = () => CandidateJob.count({
    where: condition,
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

const getCandidateJobById = (candidateJobId) => CandidateJob.findByPk(candidateJobId, {
  include: [
    {
      model: Candidate,
    },
    {
      model: Job,
    },
    {
      model: Lane,
    },
  ],
});
const getAllCandidateJob = (jobId) => CandidateJob.findAll({
  where: {
    jobId,
  },
  include: [
    {
      model: Candidate,
    },
    {
      model: Interview,
    },
    {
      model: Lane,
      where: {
        nameColumn: {
          [Op.in]: ['Screen CV', 'Schedule', 'Interview online', 'Testing', 'Considering', 'Interview F2F'],
        },
      },
    },
    {
      model: Job,
      include: {
        model: Location,
      },
    },
  ],
});

const getAllCandidateJobSale = (jobId) => CandidateJob.findAll({
  where: {
    jobId,
  },
  include: [
    {
      model: Candidate,
    },
    {
      model: Interview,
    },
    {
      model: Lane,
    },
    {
      model: Job,
      include: {
        model: Location,
      },
    },
  ],
});

const getLanePending = () => Lane.findOne({
  where: {
    nameColumn: 'Pending',
  },
});

module.exports = {
  insertCandidate,
  getCandidate,
  getCandidateAdminDetail,
  getCandidateToJob,
  getCandidateInterview,
  checkCandidate,
  insertCandidateFromCard,
  candidateHasList,
  getCandidateAddCard,
  getCandidateByJob,
  getCandidatePopup,
  insertCandidateCard,
  updateOfCreateCandidateJob,
  getCandidateJob,
  getCandidateByEmail,
  checkCodeBitlyCandidate,
  updateBitlyCandidate,
  getCandidateSearch,
  getCandidateByPhone,
  getCandidateToJobMember,
  updateParserPdfCandidateJob,
  check,
  checkExist,
  updateCandidate,
  updateCandidateJob,
  checkCandidateAndSocial,
  checkAllCandidateExists,
  getAllCandidateOfRecruiter,
  getAllCandidateOfRecruiterByJob,
  getCandidateJobById,
  getAllCandidateJob,
  getLanePending,
  getDetailProfileOfRecruiter,
  getAllCandidateRecruiter,
  getAllCandidateJobSale,
};
