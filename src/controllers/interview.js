const moment = require('moment');
const slug = require('slug');
const _ = require('lodash');
const interviewService = require('../service/interview');
const candidateService = require('../service/candidate');
const cardService = require('../service/card');
const userService = require('../service/user');
const ZoomService = require('../service/zoom/zoom');
const util = require('../common/util');
const bitly = require('../service/bitly');
const { ROLE_LEADER, ROLE_MEMBER } = require('../common/util');
const QueryBuilder = require('../service/builder/QueryBuilder');

async function getInterview(req, res) {
  try {
    const { userId, roleId } = req;
    const {
      pageSize, pageNumber, name, timeStart, timeEnd,
    } = req.query;
    const queryBuilder = new QueryBuilder();
    const role = await userService.getRoleUser(roleId);
    if (name) {
      queryBuilder.where('$CandidateJob.Candidate.email$', 'like', `${name}%`);
    }
    if (Boolean(timeStart) && Boolean(timeEnd)) {
      const addDaysTimeEnd = moment(timeEnd).add(1, 'days').format('YYYY-MM-DD');
      queryBuilder.where('timeInterview', 'between', [timeStart, addDaysTimeEnd]);
    }
    let query = queryBuilder.generateQuery();
    let interview = await interviewService.getInterview(pageSize, pageNumber, query);
    if (role.name === ROLE_MEMBER) {
      const cards = await cardService.getAllCardAssignOfUser(userId);
      const cardIds = _.map(cards, (card) => card.id);
      if (!_.isEmpty(cardIds)) {
        queryBuilder.where('cardId', 'in', cardIds);
      }
      query = queryBuilder.generateQuery();
      interview = await interviewService.getInterviewByCardIds(pageSize, pageNumber, query);
    }

    return res.send(util.sendSuccess(interview));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function insertInteriew(req, res) {
  try {
    const zoom = new ZoomService();
    const data = req.body;
    const { userId } = req;
    data.timeInterview = util.convertDateLocal(data.timeInterview);
    data.timeInterviewEnd = util.convertDateLocal(data.timeInterviewEnd);
    data.userId = req.userId;
    const dataInterview = {
      userId,
      timeInterview: data.timeInterview,
      timeInterviewEnd: data.timeInterviewEnd,
      type: data.type,
      viewer: data.viewer,
    };
    if (data.type === 'online') {
      // zoom
      const dataZoom = {
        topic: slug(`${data.jobName}`),
        type: 1,
        start_time: data.timeInterview,
        password: data.password,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          audio: 'voip',
          auto_recording: 'cloud',
        },
      };
      const metting = await zoom.createMeeting(dataZoom);
      const url = await bitly.genUrlShort(metting.data.start_url);
      dataInterview.linkZoom = await url.link;
      // zoom
    }
    const checkSameTimeInterview = await
    interviewService
      .checkInterviewTimeExists(data.timeInterview, data.timeInterviewEnd, data.jobId);
    if (checkSameTimeInterview) {
      return res.status(500).send({
        error: `Your interview was matched with the candidate
       ${checkSameTimeInterview.CandidateJob.Candidate.email} of job ${checkSameTimeInterview.CandidateJob.Job.title}`,
      });
    }
    const getCandidateJob = await candidateService.getCandidateJob(data.candidateId, data.jobId);
    if (getCandidateJob) {
      dataInterview.cardId = getCandidateJob.id;
    }

    const interview = await interviewService.insertInteriew(dataInterview);
    if (!interview) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    console.log('chuhuumanh', dataInterview);
    return res.send(util.sendSuccess({ successed: true }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function updateInteriew(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const zoom = new ZoomService();

    const detailInterview = await interviewService.interviewDetail(id);
    data.timeInterview = util.convertDateLocal(data.timeInterview);
    data.timeInterviewEnd = util.convertDateLocal(data.timeInterviewEnd);

    const checkSameTimeInterview = await interviewService
      .checkInterviewTimeExists(data.timeInterview,
        data.timeInterviewEnd,
        detailInterview.CandidateJob.jobId);
    if (checkSameTimeInterview && Number(checkSameTimeInterview.id) !== Number(id)) {
      return res.status(500).send({ error: 'Same time' });
    }
    if (data.type === 'online') {
      // zoom
      const dataZoom = {
        topic: slug(`${detailInterview.CandidateJob.Candidate.name} ${detailInterview.CandidateJob.Candidate.namsqeJob}`),
        type: 1,
        start_time: data.timeInterview,
        password: data.password,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          audio: 'voip',
          auto_recording: 'cloud',
        },
      };
      const metting = await zoom.createMeeting(dataZoom);
      const url = await bitly.genUrlShort(metting.data.start_url);
      data.linkZoom = await url.link;
      // zoom
    }

    const interview = await interviewService.updateInteriew(id, data);
    if (!interview) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    return res.send(util.sendSuccess({ interview }));
  } catch (err) {
    console.log('interview', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function interviewDetail(req, res) {
  try {
    const { id } = req.params;
    const interview = await interviewService.interviewDetail(id);
    if (!interview) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    // interview.dataValues.timeInterview = convertDateLocal(interview.timeInterview);
    // interview.dataValues.timeInterviewEnd = convertDateLocal(interview.timeInterviewEnd);
    return res.send(util.sendSuccess({ interview }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function interviewDelete(req, res) {
  try {
    const { id } = req.params;
    const interview = await interviewService.interviewDelete(id);
    if (!interview) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    return res.send(util.sendSuccess({ interviewId: interview.id }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function insertCardInterview(req, res) {
  try {
    const zoom = new ZoomService();
    const data = req.body;
    const item = {
      cardId: data.cardId,
      linkZoom: data.linkZoom,
      userId: req.userId,
      timeInterview: util.convertDateLocal(data.timeInterview),
      timeInterviewEnd: util.convertDateLocal(data.timeInterviewEnd),
      type: data.type,
    };

    const checkSameTimeInterview = await interviewService
      .checkInterviewTimeExists(item.timeInterview, item.timeInterviewEnd, data.jobId);
    if (checkSameTimeInterview) {
      return res.status(500).send({ error: 'Same time' });
    }
    if (data.type === 'online') {
      // zoom
      const dataZoom = {
        topic: slug(`${data.nameJob}`),
        type: 1,
        start_time: data.timeInterview,
        password: data.password,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          audio: 'voip',
          auto_recording: 'cloud',
        },
      };
      const metting = await zoom.createMeeting(dataZoom);
      const url = await bitly.genUrlShort(metting.data.start_url);
      item.linkZoom = await url.link;
      // zoom
    }
    const interview = await interviewService.insertInteriew(item);
    return res.send(util.sendSuccess({ interview }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function calendarInterview(req, res) {
  const { userId, roleId } = req;
  const { start, end } = req.query;
  let interviews = [];
  let result = {};
  if (start === '' && end === '') {
    return res.status(500).send({ error: 'errors' });
  }
  try {
    const role = await userService.getRoleUser(roleId);

    if (role.name === ROLE_LEADER) {
      const user = await userService.getTeamOfUserById(userId);
      const usersTeam = _.map(user.Team.Users, (userTeam) => userTeam.id);
      interviews = await interviewService.calendarInterviewLeader(start, end, usersTeam);
    } else {
      interviews = await interviewService.calendarInterviewMember(start, end, userId);
    }
    _.map(interviews, (interview) => _.assign(interview.dataValues, { timeInterviewFormat: moment.utc(interview.timeInterview).add(7, 'hours').format('DD/MM/YYYY') }));
    _.chain(interviews)
      .groupBy('dataValues.timeInterviewFormat')
      .map((value, key) => {
        result[key] = {
          interviews: value,
        };
        return value;
      })
      .value();
    return res.send(util.sendSuccess({ calendar: result }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

async function updateReviewInterview(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log(data);
    const interview = await interviewService.updateInteriew(id, data);
    return res.send(util.sendSuccess({ interview }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  getInterview,
  insertInteriew,
  updateInteriew,
  interviewDetail,
  interviewDelete,
  insertCardInterview,
  calendarInterview,
  updateReviewInterview,
};
