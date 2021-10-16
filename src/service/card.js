const Sequelize = require('sequelize');
const {
  CardUser,
  User,
  Lane,
  Team,
  Interview,
  CandidateJob,
  Candidate,
  Job,
  Client,
  Location,
  Label,
  Comment,
} = require('../../models');

const { Op } = Sequelize;

const insertCard = async (data) => {
  const card = await CandidateJob.create(data);
  return card;
};

const getAllCards = async () => CandidateJob.findAll({
  where: {
    isAddcard: true,
  },
  include: [
    {
      model: User,
    },
    {
      model: CardUser,
    },
    {
      model: Lane,
    },
    {
      model: Interview,
    },
    {
      model: Candidate,
    },
    {
      model: Job,
      attributes: ['id', 'title'],
      include: [
        {
          model: Client,
          attributes: ['id', 'name', 'background'],
        },
        {
          model: Location,
          attributes: ['id', 'name'],
        },
      ],
    },
  ],
});
const getCardByIdRawData = async (id) => CandidateJob.findByPk(id, {
  where: {
    id,
  },
  raw: true,
  nest: true,
  include: [
    {
      model: User,
    },
    {
      model: CardUser,
    },
    {
      model: Lane,
    },
    {
      model: Interview,
    },
    {
      model: Candidate,
    },
    {
      model: Job,
      attributes: ['id', 'title'],
      include: [
        {
          model: Client,
          attributes: ['id', 'name', 'background'],
        },
        {
          model: Location,
          attributes: ['id', 'name'],
        },
      ],
    },
  ],
});

const getCardById = async (id) => CandidateJob.findByPk(id, {
  where: {
    id,
  },
  include: [
    {
      model: User,
      attributes: ['id', 'roleId', 'name', 'linkAvatar'],
    },
    {
      model: CardUser,
      include: [
        {
          model: User,
          attributes: ['id', 'roleId', 'name', 'linkAvatar'],
        },
      ],
    },
    {
      model: Lane,
    },
    {
      model: Interview,
    },
    {
      model: Candidate,
    },
    {
      model: Job,
      attributes: ['id', 'title'],
      include: [
        {
          model: Client,
          attributes: ['id', 'name', 'background'],
        },
        {
          model: Location,
          attributes: ['id', 'name'],
        },
      ],
    },
  ],
});

const getCardUserByUserAndCardId = async (userId, cardId) => CardUser.findOne({
  where: {
    cardId,
    userId,
  },
});

// code test lay card theo leader
// const getAllCardLeader = async (idTeam) => {
//   let cards = await CandidateJob.findAll({
//     include: [
//       {
//         model: User,
//         where: {
//           teamId: idTeam,
//         },
//       },
//     ],
//   });
//   return cards;
// };

const getAllCardOfTeamByIds = async (ids) => Lane.findAll({
  order: [[CandidateJob, 'createdAt', 'desc']],
  include: {
    model: CandidateJob,
    required: false,
    where: {
      storage: false,
    },
    include: [
      {
        model: User,
      },
      {
        model: CardUser,
        where: {
          userId: {
            [Op.in]: ids,
          },
        },
      },
      {
        model: Lane,
      },
      {
        model: Interview,
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Client,
            attributes: ['id', 'name', 'background'],
          },
          {
            model: Location,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  },
});

const getDataDashBoardCv = async (startDate, endDate) => {
  let data = await Team.findAll({
    include: [
      {
        model: User,
        include: [
          {
            model: CandidateJob,
            where: {
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
          },
        ],
      },
    ],
  });
  // console.log('isdata', data);
  return data;
};

const getAllCardUser = async (cardId) => CardUser.findAll({
  where: {
    cardId,
  },
});

const getDataDashBoardCvLeader = async (id, startDate, endDate) => {
  let userLeader = await User.findByPk(id);
  let data = await Team.findAll({
    include: [
      {
        model: User,
        where: {
          teamId: userLeader.teamId,
        },
        include: [
          {
            model: CandidateJob,
            where: {
              createdAt: {
                [Op.between]: [startDate, endDate],
              },
            },
          },
        ],
      },
    ],
  });
  return data;
};

const updateCard = async (id, data) => {
  const card = await CandidateJob.findByPk(id);
  await card.update(data);
  return card;
};

const getAllCardInIds = (ids, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => CandidateJob.findAll({
    order: [['createdAt', 'DESC']],
    offset: skip,
    limit,
    include: [
      {
        model: User,
        where: {
          id: ids,
        },
      },
      {
        model: Lane,
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        where: {
          jobStatus: 'Active',
        },
      },
    ],
  });

  const getCount = () => CandidateJob.count({
    distinct: 'Card.id',
    include: [
      {
        model: User,
        where: {
          id: ids,
        },
      },
      {
        model: Job,
        where: {
          jobStatus: 'Active',
        },
      },
      {
        model: Lane,
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

const countCardByIdJob = (idJob, startDate, endDate) => CandidateJob.count({
  where: {
    jobId: idJob,
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  },
});

const getAllCardAssignOfUser = (userId) => {
  const cards = CandidateJob.findAll({
    attributes: ['id'],
    include: {
      model: CardUser,
      where: {
        userId,
      },
    },
  });
  return cards;
};

const insertArrayUserCard = (items, cardId) => {
  items.map((item) => {
    CardUser.create({
      userId: item,
      cardId,
    });
    return item;
  });
  return true;
};

const countCandidateJobLane = (laneId) => {
  const count = CandidateJob.count({
    where: {
      laneId,
    },
  });
  return count;
};

const getLaneCard = () => {
  const lanes = Lane.findAll({
    // order :[['createdAt','ASC']],
    include: {
      order: [['createdAt', 'DESC']],
      model: CandidateJob,
      required: false,
      where: {
        storage: false,
      },
      limit: 5,
      include: [
        {
          model: User,
        },
        {
          model: CardUser,
        },
        {
          model: Lane,
        },
        {
          model: Interview,
        },
        {
          model: Candidate,
        },
        {
          model: Job,
          attributes: ['id', 'title'],
          include: [
            {
              model: Client,
              attributes: ['id', 'name', 'background'],
            },
            {
              model: Location,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    },
  });
  return lanes;
};

const getLaneCardDetail = (laneId, offset) => {
  const cards = CandidateJob.findAll({
    order: [['createdAt', 'DESC']],
    offset: Number(offset),
    limit: 5,
    where: {
      storage: false,
      laneId,
    },
    include: [
      {
        model: User,
      },
      {
        model: CardUser,
      },
      {
        model: Lane,
      },
      {
        model: Interview,
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Client,
            attributes: ['id', 'name', 'background'],
          },
          {
            model: Location,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  });
  return cards;
};

// const getLaneCardDetailLeader = (laneId, offset, ids) => {
//   const cards = CandidateJob.findAll({
//     order: [['createdAt', 'DESC']],
//     offset: Number(offset),
//     limit: 5,
//     where: {
//       storage: false,
//       laneId,
//     },
//     include: [
//       {
//         model: User,
//       },
//       {
//         model: CardUser,
//         where: {
//           userId: {
//             [Op.in]: ids,
//           },
//         },
//       },
//       {
//         model: Lane,
//       },
//       {
//         model: Interview,
//       },
//       {
//         model: Candidate,
//       },
//       {
//         model: Job,
//         attributes: ['id', 'title'],
//         include: [
//           {
//             model: Client,
//             attributes: ['id', 'name', 'background'],
//           },
//           {
//             model: Location,
//             attributes: ['id', 'name'],
//           },
//         ],
//       },
//     ],
//   });
//   return cards;
// };

const getAllCardByUserId = async (ids) => Lane.findAll({
  order: [[CandidateJob, 'createdAt', 'desc']],
  include: {
    model: CandidateJob,
    required: false,
    where: {
      storage: false,
    },
    include: [
      {
        model: User,
      },
      {
        model: CardUser,
        where: {
          userId: {
            [Op.in]: [ids],
          },
        },
      },
      {
        model: Lane,
      },
      {
        model: Interview,
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Client,
            attributes: ['id', 'name', 'background'],
          },
          {
            model: Location,
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
  },
});

// const getLaneCardDetailMember = (laneId, offset, id) => {
//   const cards = CandidateJob.findAll({
//     order: [['createdAt', 'DESC']],
//     offset: Number(offset),
//     limit: 5,
//     where: {
//       storage: false,
//       laneId,
//     },
//     include: [
//       {
//         model: User,
//       },
//       {
//         model: CardUser,
//         where: {
//           userId: id,
//         },
//       },
//       {
//         model: Lane,
//       },
//       {
//         model: Interview,
//       },
//       {
//         model: Candidate,
//       },
//       {
//         model: Job,
//         attributes: ['id', 'title'],
//         include: [
//           {
//             model: Client,
//             attributes: ['id', 'name', 'background'],
//           },
//           {
//             model: Location,
//             attributes: ['id', 'name'],
//           },
//         ],
//       },
//     ],
//   });
//   return cards;
// };

const getAllSearchCards = async (search, userIds) => CandidateJob.findAll({
  where: {
    isAddcard: true,
    [Op.or]: {
      '$Candidate.name$': {
        [Op.like]: `${search}%`,
      },
      '$Job.title$': {
        [Op.like]: `${search}%`,
      },
    },
  },
  include: [
    {
      model: User,
    },
    {
      model: CardUser,
      where: {
        userId: {
          [Op.in]: userIds,
        },
      },
    },
    {
      model: Lane,
    },
    {
      model: Interview,
    },
    {
      model: Candidate,
    },
    {
      model: Job,
      attributes: ['id', 'title'],
      include: [
        {
          model: Client,
          attributes: ['id', 'name', 'background'],
        },
        {
          model: Location,
          attributes: ['id', 'name'],
        },
      ],
    },
  ],
});

const getAllCardNewVersion = async (query, ids, role) => {
  const lengthQuery = Object.getOwnPropertyNames(query);
  // eslint-disable-next-line no-nested-ternary
  const limit = role === 'Director' ? lengthQuery.length > 1 ? null : 5 : null;
  const lanes = await Lane.findAll({
    where: {
      disabled: false,
    },
    order: role === 'Director' ? null : [[CandidateJob, 'createdAt', 'desc']],

    include: {
      model: CandidateJob,
      order: role === 'Director' ? [['createdAt', 'desc']] : null,
      limit,
      where: query,
      required: false,
      subQuery: false,
      attributes: ['id', 'laneId', 'position', 'approachDate', 'expectedDate', 'dueDate', 'cv', 'refineCv', 'noteApproach', 'jobId', 'isRefinePdf', 'referalId', 'candidateId', 'noteRecruiter', 'createdAt'],
      include: [
        {
          model: User,
          attributes: ['name', 'id', 'email', 'linkAvatar'],
        },
        {
          model: CardUser,
          where: {
            userId: {
              [Op.in]: ids,
            },
          },
        },
        {
          model: Lane,
          attributes: ['id', 'nameColumn'],
        },
        {
          model: Interview,
        },
        {
          model: Candidate,
          attributes: ['id', 'name', 'phone', 'email', 'facebook', 'linkedin', 'skype'],
        },
        {
          model: Job,
          attributes: ['id', 'title'],
          include: [
            {
              model: Client,
              attributes: ['id', 'name', 'background'],
            },
            {
              model: Location,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Label,
          attributes: ['id', 'title', 'background', 'candidateJobId'],
        },
      ],

    },
    subQuery: false,
  });

  return lanes;
};

const getAllCardsLane = (query, offset, ids) => {
  const cards = CandidateJob.findAll({
    order: [['createdAt', 'DESC']],
    offset: Number(offset),
    limit: 4,
    where: query,
    include: [
      {
        model: User,
      },
      {
        model: CardUser,
        where: {
          userId: {
            [Op.in]: ids,
          },
        },
      },
      {
        model: Lane,
      },
      {
        model: Interview,
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        attributes: ['id', 'title'],
        include: [
          {
            model: Client,
            attributes: ['id', 'name', 'background'],
          },
          {
            model: Location,
            attributes: ['id', 'name'],
          },
        ],
      },
      {
        model: Label,
        attributes: ['id', 'title', 'background', 'candidateJobId'],
      },
    ],
  });
  return cards;
};

const createLabel = (data) => Label.create(data);

const getLabelReferral = () => Label.findOne({
  where: {
    title: 'Referral',
  },
});

const removeLabel = async (id) => {
  const label = await Label.findByPk(id);
  if (label) {
    await label.destroy();
  }
  return label;
};

const getAllLabelIds = (label) => {
  const labels = Label.findAll({
    attributes: ['candidateJobId'],
    where: {
      title: {
        [Op.like]: `${label}%`,
      },
    },
  });
  return labels;
};

const createCommentCard = async (data) => {
  const comment = await Comment.create(data);
  const getComentAfterCreate = Comment.findByPk(comment.id, {
    include: {
      model: User,
    },
  });
  return getComentAfterCreate;
};

const getCommentOfCard = (cardId) => Comment.findAll({
  order: [['updatedAt', 'desc']],
  where: {
    candidateJobId: cardId,
  },
  include: {
    model: User,
    attributes: ['name', 'email', 'linkAvatar'],
  },
});

const destroyCommentOfCard = async (commentId) => {
  const comment = await Comment.findByPk(commentId);
  await comment.destroy();
  return comment;
};

const updateCommentOfCard = async (commentId, data) => {
  const comment = await Comment.findByPk(commentId);
  await comment.update(data);
  return comment;
};

const getAllLabel = async () => {
  const labels = await Label.findAll({
    attributes: ['id', 'title', 'background'],
  });
  return labels;
};

const getCardsByLane = (laneName, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => CandidateJob.findAll({
    order: [['createdAt', 'DESC']],
    offset: skip,
    limit,
    include: [
      {
        model: User,
      },
      {
        model: Lane,
        where: {
          nameColumn: laneName,
        },
      },
      {
        model: Candidate,
      },
      {
        model: Job,
        // where: {
        //   jobStatus: 'Active',
        // },
      },
    ],
  });

  const getCount = () => CandidateJob.count({
    distinct: 'Card.id',
    include: [
      {
        model: User,
      },
      {
        model: Job,
        // where: {
        //   jobStatus: 'Active',
        // },
      },
      {
        model: Lane,
        where: {
          nameColumn: laneName,
        },
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

module.exports = {
  getAllCards,
  insertCard,
  getAllCardByUserId,
  getCardById,
  getCardUserByUserAndCardId,
  // getAllCardLeader,
  getAllCardOfTeamByIds,
  getDataDashBoardCv,
  getAllCardUser,
  getDataDashBoardCvLeader,
  updateCard,
  getAllCardInIds,
  countCardByIdJob,
  getAllCardAssignOfUser,
  insertArrayUserCard,
  getLaneCard,
  countCandidateJobLane,
  getLaneCardDetail,
  // getLaneCardDetailLeader,
  // getLaneCardDetailMember,
  getCardByIdRawData,
  getAllSearchCards,

  // current use 2 this func
  getAllCardNewVersion,
  getAllCardsLane,
  createLabel,
  removeLabel,
  getAllLabelIds,
  createCommentCard,
  getCommentOfCard,
  destroyCommentOfCard,
  updateCommentOfCard,
  getAllLabel,
  getLabelReferral,
  getCardsByLane,
};
