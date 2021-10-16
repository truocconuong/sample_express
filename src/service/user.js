const Sequelize = require('sequelize');

const { Op } = Sequelize;
const {
  User,
  Role,
  Team,
  Notification,
  Job,
  UserJob,
  BankRecruiter,
  CandidateJob,
} = require('../../models');
const {
  ROLE_LEADER, ROLE_DIRECTOR, ROLE_MEMBER, ROLE_ADMIN, Leader,
} = require('../common/util');

const checkEmail = (email) => User.count({
  where: {
    email,
  },
});

const getRoleUser = (roleId) => Role.findByPk(roleId, {
  attributes: ['name'],
});

const getUserByEmail = (email) => User.findAll({
  where: {
    email,
  },
});

const insertUser = async (data) => {
  const user = await User.create({
    email: data.email,
    password: data.password,
    name: data.name,
    roleId: data.roleId,
    teamId: data.teamId,
    isDelete: false,
  });
  return user;
};

const getListUser = (pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => User.findAll({
    offset: skip,
    limit,
    where: {
      isDelete: false,
    },
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'email', 'teamId', 'linkAvatar'],
    include: [
      {
        model: Role,
        attributes: ['id', 'name'],
      },
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
  });
  const getCount = () => User.count({
    where: {
      isDelete: false,
    },
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

const updateUser = async (userId, data) => {
  let user = await User.findByPk(userId);
  if (!user) {
    return false;
  }
  user.name = data.name;
  user.email = data.email;
  user.roleId = data.roleId;
  user.teamId = data.teamId;
  await user.save();
  return user;
};

const updateAllDataUser = async (userId, data) => {
  let user = await User.findByPk(userId);

  if (!user) {
    return false;
  }
  await user.update(data);
  return user;
};

const deleteUser = async (id) => {
  let user = await User.findByPk(id);
  user.isDelete = true;
  await user.save();
  return user;
};

const getUserById = (id) => User.findByPk(id, {
  attributes: ['id', 'roleId', 'teamId', 'email', 'name', 'linkAvatar', 'isVerify'],
});

const getTeamOfUserById = (id) => User.findByPk(id, {
  include: {
    model: Team,
    include: {
      model: User,
      include: {
        model: Job,
      },
    },
  },
});

const getUserUpdate = (id) => User.findByPk(id, {
  attributes: ['id', 'roleID', 'email', 'password'],
});

const getAllUser = () => User.findAll({
  include: {
    model: Role,
  },
  where: {
    isDelete: false,
  },
});

const getAllUserByTeamId = (teamId) => User.findAll({
  where: {
    teamId,
    isDelete: false,
  },
});

const getNameTeamUser = async (id) => {
  let user = await User.findByPk(id, {
    attributes: ['id', 'name'],
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
  });
  if (user.Team) {
    return user.Team.name;
  }
  let result = '';
  return result;
};

const getAllUserToTeam = async (idTeam) => {
  let users = await User.findAll({
    where: {
      teamId: idTeam,
      isDelete: false,
    },
    attributes: ['id', 'name'],
    order: [['createdAt', 'DESC']],
  });
  return users;
};

const updateLastLoginUser = async (id, tokenAuth, tokenTimeStamp) => {
  let user = await User.findByPk(id);
  user.lastLogin = new Date();
  user.tokenAuth = tokenAuth;
  user.tokenTimeStamp = tokenTimeStamp;
  await user.save();
};

const diretorGetLastLoginUser = async () => {
  let data = await User.findAll({
    where: {
      isDelete: false,
    },
    attributes: ['id', 'name', 'lastLogin', 'linkAvatar'],
  });
  return data;
};

const leaderGetLastLoginUser = async (id) => {
  let userLeader = await User.findByPk(id);
  let data = await User.findAll({
    where: {
      teamId: userLeader.teamId,
      isDelete: false,
    },
    attributes: ['id', 'name', 'lastLogin', 'linkAvatar'],
  });
  return data;
};

const diretorGetUserTrello = async () => {
  let users = await User.findAll({
    where: {
      isDelete: false,
    },
    attributes: ['id', 'name', 'email', 'linkAvatar'],
  });
  return users;
};

const leaderGetUserTrello = async (idTeam) => {
  let users = await User.findAll({
    where: {
      teamId: idTeam,
      isDelete: false,
    },
    attributes: ['id', 'name', 'email', 'linkAvatar'],
  });
  return users;
};
const getUserCheck = (id) => User.findByPk(id, {
  attributes: ['id', 'name', 'roleID', 'tokenAuth', 'tokenTimeStamp'],
  include: [
    {
      model: Role,
      attributes: ['name'],
    },
  ],
});

const saveLastLogin = async (id) => {
  let user = await User.findByPk(id);
  user.lastLogin = new Date();
  await user.save();
};

const nameAndTeamUser = async (id) => {
  let data = await User.findByPk(id, {
    attributes: ['id', 'name', 'linkAvatar'],
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
  });
  let user = {
    name: data.name,
    nameTeam: data.Team.name,
    linkAvatar: data.linkAvatar,
  };
  return user;
};

const leaderGetUserTask = async (idTeam, idLeader) => {
  let users = await User.findAll({
    where: {
      teamId: idTeam,
      isDelete: false,
      id: {
        [Op.ne]: idLeader,
      },
    },
    attributes: ['id', 'name', 'email', 'linkAvatar'],
  });
  return users;
};

const getListUserLeader = async (id, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  let userLeader = await User.findByPk(id);
  let users = await User.findAndCountAll({
    where: {
      teamId: userLeader.teamId,
      isDelete: false,
    },
    offset: skip,
    limit,
    include: [
      {
        model: Role,
        attributes: ['id', 'name'],
      },
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'email', 'teamId', 'linkAvatar'],
  });
  return users;
};

const getProfileUser = (id) => User.findByPk(id, {
  attributes: ['id', 'name', 'email', 'linkAvatar', 'showRules', 'isDelete'],
  include: [
    {
      model: Role,
      attributes: ['id', 'name'],
    },
    {
      model: Team,
      attributes: ['id', 'name'],
    },
    {
      model: Notification,
    },
  ],
});

const updateAvatar = async (id, linkAvatar) => {
  let user = await User.findByPk(id);
  user.linkAvatar = linkAvatar;
  await user.save();
  return user;
};

const getDetailUser = async (id) => {
  const user = await User.findByPk(id, {
    attributes: ['name', 'email', 'linkAvatar'],
    include: [
      {
        model: Role,
        attributes: ['name'],
      },
      {
        model: Team,
        attributes: ['name'],
      },
    ],
  });
  return user;
};

const getUserAssign = () => User.findAll({
  where: {
    isDelete: false,
    roleId: {
      [Op.ne]: '48185027-b261-4766-91b7-b1c1343b0f29', // khac role director
    },
  },
  attributes: ['id', 'name', 'linkAvatar'],
});

const directorUserAssign = () => User.findAll({
  where: {
    isDelete: false,
    roleId: '4cfbcf03-7f25-4c44-abb2-712ac449583d',
  },
  attributes: ['id', 'name', 'linkAvatar'],
});

const getJobUser = (id) => User.findByPk(id, {
  include: {
    model: Job,
  },
});

const getBitlyCodeUser = async (idJob, idUser) => {
  let users = await UserJob.findOne({
    where: {
      isDelete: false,
      userId: idUser,
      jobId: idJob,
    },
    attributes: ['codeBitly'],
  });
  return users;
};
const getUSerByCodeBitly = async (codeBitly) => {
  let users = await UserJob.findOne({
    where: {
      isDelete: false,
      codeBitly,
    },
    attributes: ['userId'],
  });
  return users;
};

const getAllLeader = async () => {
  const users = await User.findAll({
    include: {
      model: Role,
      where: {
        name: ROLE_LEADER,
      },
    },
  });
  return users;
};

const getUserDirector = async () => User.findAll({
  where: {
    roleId: '48185027-b261-4766-91b7-b1c1343b0f29',
  },
  attributes: ['id'],
});

const getAllDirector = async () => {
  const users = await User.findAll({
    include: {
      model: Role,
      where: {
        name: ROLE_DIRECTOR,
      },
    },
  });
  return users;
};

const getAllAdmin = async () => {
  const users = await User.findAll({
    include: {
      model: Role,
      where: {
        name: ROLE_ADMIN,
      },
    },
  });
  return users;
};

const searchAllLeadersAndMembers = (text) => {
  const users = User.findAll({
    where: {
      [Op.or]: {
        email: {
          [Op.like]: `${text}%`,
        },
        name: {
          [Op.like]: `${text}%`,
        },
      },
    },
    include: {
      model: Role,
      where: {
        name: {
          [Op.in]: [ROLE_LEADER, ROLE_MEMBER],
        },
      },
    },
  });
  return users;
};

const getListUserByRoleId = async (roleId, pageSize, pageNumber) => {
  let skip = Number(pageSize * (pageNumber - 1));
  let limit = Number(pageSize);
  const getList = () => User.findAll({
    offset: skip,
    limit,
    where: {
      roleId,
    },
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'email', 'teamId', 'linkAvatar', 'isDelete'],
  });
  const getCount = () => User.count({
    offset: skip,
    limit,
    where: {
      roleId,
    },
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

const getRoleRecruiter = () => Role.findOne({
  where: {
    name: 'Recruiter',
  },
});

const insertRecruiter = async (data) => {
  const user = await User.create({
    email: data.email,
    password: data.password,
    name: data.name,
    roleId: data.roleId,
    isDelete: true,
  });
  return user;
};

const getDetailRecruiter = async (recruiterId) => {
  const user = await User.findByPk(recruiterId, {
    attributes: ['name', 'email'],
    include: {
      model: BankRecruiter,
      atrributes: ['bankNumber', 'name', 'bankName', 'urlFrontImageIdCard', 'urlBehindImageIdCard'],
    },

  });

  return user;
};

const findById = (id) => User.findByPk(id, {
  include: {
    model: Role,
  },
});

const findEmail = (email) => User.findOne({
  where: {
    email,
  },
  include: {
    model: Role,
  },
});

const getUserBySocial = (socialId, social) => User.findOne({
  where: {
    socialId,
    social,
  },
});

const createAllUser = (data) => User.create(data);

const getAllRecruiter = () => User.findAll({
  include: [{
    model: Role,
    where: {
      name: 'Recruiter',
    },
  },
  {
    model: CandidateJob,
  },

  ],
});
const getLeaderOfTeam = (teamId) => User.findOne({
  where: {
    teamId,
  },
  include: {
    model: Role,
    where: {
      name: Leader,
    },
  },
});

const getAllLeaderOfMember = (userId) => User.findByPk(userId, {
  include: {
    model: Team,
    include: {
      model: User,
      include: {
        model: Role,
      },
    },
  },
});


module.exports = {
  checkEmail,
  getUserByEmail,
  insertUser,
  getRoleUser,
  getListUser,
  updateUser,
  deleteUser,
  getUserById,
  getTeamOfUserById,
  getAllUser,
  getUserUpdate,
  getAllUserByTeamId,
  getNameTeamUser,
  getAllUserToTeam,
  updateLastLoginUser,
  diretorGetLastLoginUser,
  leaderGetLastLoginUser,
  diretorGetUserTrello,
  leaderGetUserTrello,
  getUserCheck,
  saveLastLogin,
  nameAndTeamUser,
  leaderGetUserTask,
  getListUserLeader,
  getProfileUser,
  updateAvatar,
  getDetailUser,
  getUserAssign,
  directorUserAssign,
  getJobUser,
  getBitlyCodeUser,
  getUSerByCodeBitly,
  getAllLeader,
  getUserDirector,
  getAllDirector,
  searchAllLeadersAndMembers,
  getListUserByRoleId,
  getRoleRecruiter,
  updateAllDataUser,
  insertRecruiter,
  getDetailRecruiter,
  findById,
  findEmail,
  getUserBySocial,
  createAllUser,
  getAllRecruiter,
  getLeaderOfTeam,
  getAllAdmin,
  getAllLeaderOfMember
};
