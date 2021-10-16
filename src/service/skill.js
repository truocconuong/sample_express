const { Skill, JobSkill } = require('../../models');

const getAllSkill = async () => {
  let skills = await Skill.findAll({
    attributes: ['id', 'name'],
  });
  return skills;
};

const postSkill = (name) => Skill.create({ name });

const checkSkillId = (id) => Skill.findByPk(id);

const getAllSkillApply = () => Skill.findAll({
  include: {
    model: JobSkill,
  },
});

module.exports = {
  getAllSkill,
  postSkill,
  checkSkillId,
  getAllSkillApply,
};
