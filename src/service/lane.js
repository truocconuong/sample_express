const { Lane, CandidateJob } = require('../../models');

const getListLane = () => Lane.findAll({
  include: {
    order: [['id', 'DESC']],
    limit: 5,
    model: CandidateJob,
    attributes: ['id'],
  },
});

const insertLane = async (data) => {
  const lane = await Lane.create({
    nameColumn: data.nameColumn,
  });
  return lane;
};

const findById = (id) => Lane.findByPk(id);

module.exports = {
  insertLane,
  findById,
  getListLane,
};
