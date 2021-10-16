const _ = require('lodash');
const skillService = require('../service/skill');
const util = require('../common/util');

async function getAllSkill(req, res) {
  try {
    let skills = await skillService.getAllSkillApply();
    const listSkills = [];

    _.map(skills, (skill) => {
      if (!_.isEmpty(skill.JobSkills)) {
        listSkills.push(skill);
      }
      return skill;
    });
    return res.send(util.sendSuccess({ skills }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function searchSkill(req, res) {
  try {
    let { skill } = req.body;
    const allSkill = await skillService.getAllSkill();
    let arrSkill = allSkill.filter(
      (item) => item.name.toLowerCase().indexOf(skill.toLowerCase()) > -1,
    );
    return res.status(201).json(arrSkill);
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function createSkill(req, res) {
  try {
    const { skill } = req.body;
    let result = await skillService.postSkill(skill);
    return res.send(util.sendSuccess({ result }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

module.exports = {
  getAllSkill,
  searchSkill,
  createSkill,
};
