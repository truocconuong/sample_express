const { Team, User } = require('../../models');

const insertTeam = async (data) => {
  const team = await Team.create(data);
  return team;
};

const findById = (id) => Team.findByPk(id,
  {
    include: {
      model: User,
      // where: {
      //   isDelete: false,
      // },
    },
  });

const getListTeam = (pageSize, pageNumber) => {
  const skip = Number(pageSize * (pageNumber - 1));
  const limit = Number(pageSize);
  const getList = () => Team.findAll({
    offset: skip,
    limit,
    include: {
      model: User,
      // where: {
      //   isDelete: false,
      // },
    },
  });
  const getCount = () => Team.count();
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
const getAllTeam = async () => {
  let teams = await Team.findAll({
    attributes: ['id', 'name'],
  });
  return teams;
};

module.exports = {
  insertTeam,
  findById,
  getListTeam,
  getAllTeam,
};
