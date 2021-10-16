const { forEach } = require('async-foreach');
const _ = require('lodash');
const teamService = require('../service/team');
const userService = require('../service/user');
const util = require('../common/util');
const { ROLE_DIRECTOR, ROLE_LEADER } = require('../common/util');

async function getListTeam(req, res) {
  try {
    const { pageSize, pageNumber } = req.query;
    const user = await teamService.getListTeam(pageSize, pageNumber);
    return res.send(util.sendSuccess(user));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function addTeam(req, res) {
  try {
    const { name, idLeader } = req.body;
    const data = {
      name, idLeader,
    };
    const team = await teamService.insertTeam(data);

    if (!_.isNil(idLeader)) {
      const user = await userService.getUserById(idLeader);
      await user.update({ teamId: team.id });
    }
    return res.send(util.sendSuccess(team));
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateTeam(req, res) {
  try {
    const { teamId } = req.params;
    const data = req.body;

    const { members } = req.body;

    const team = await teamService.findById(teamId);
    if (!team) {
      return res.send(util.sendError('404', 'Team not found'));
    }

    const usersTeam = await userService.getAllUserByTeamId(team.id);

    forEach(usersTeam, async (user) => {
      const checkUserStillExistsTeam = _.find(members, (member) => member.id === user.id);
      if (_.isNil(checkUserStillExistsTeam)) {
        await user.update({ teamId: null });
      }
    });

    forEach(members, async (member) => {
      const user = await userService.getUserById(member.id);
      await user.update({ teamId: team.id });
    });

    await team.update(data);
    return res.send(util.sendSuccess());
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function deleteTeam(req, res) {
  try {
    const { teamId } = req.params;
    const team = await teamService.findById(teamId);
    if (!team) {
      return res.send(util.sendError('404', 'Team not found'));
    }
    await team.destroy();
    return res.send(util.sendSuccess());
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function detailTeam(req, res) {
  try {
    const { teamId } = req.params;

    const team = await teamService.findById(teamId);
    if (!team) {
      return res.send(util.sendError('404', 'team not found'));
    }
    return res.send(util.sendSuccess({ team }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllTeam(req, res) {
  try {
    const { roleId, userId } = req;
    const role = await userService.getRoleUser(roleId);
    let teams = [];
    if (role.name === ROLE_DIRECTOR) {
      teams = await teamService.getAllTeam();
      return res.send(util.sendSuccess({ teams }));
    } if (role.name === ROLE_LEADER) {
      let userLeader = await userService.getProfileUser(userId);
      let data = {
        id: userLeader.Team.id,
        name: userLeader.Team.name,
      };
      teams.push(data);
      return res.send(util.sendSuccess({ teams }));
    }
    return res.send(util.sendSuccess({ teams }));
  } catch (err) {
    return res
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getListTeam,
  addTeam,
  updateTeam,
  deleteTeam,
  detailTeam,
  getAllTeam,
};
