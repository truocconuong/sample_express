const uniqueString = require('unique-string');
const slug = require('slug');
const moment = require('moment');
const { forEach } = require('async-foreach');
const { nanoid } = require('nanoid');
const ejs = require('ejs');
const appRoot = require('app-root-path');
const pdf = require('html-pdf');
const diff = require('deep-diff');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const jobService = require('../service/job');
const locationService = require('../service/location');
const userService = require('../service/user');
const tagService = require('../service/tag');
const util = require('../common/util');
const { ROLE_DIRECTOR, ROLE_LEADER } = require('../common/util');
const config = require('../../config');
const bitly = require('../service/bitly');
const notificationService = require('../service/notification');
const historyService = require('../service/history');
const SocketIO = require('../service/socket/socket');
const QueryBuilder = require('../service/builder/QueryBuilder');

async function postJob(req, res) {
  try {
    let data = req.body;
    slug.charmap['/'] = '-';
    let slugJob = slug(`${req.body.title} ${uniqueString()}`);
    data.userId = req.userId;
    data.slug = slugJob;
    let job = await jobService.postJob(data);
    let user = await userService.getUserById(req.userId); // lay user tao job
    let history = {
      content: `${user.name} has created a job: ${job.title}`,
      idJob: job.id,
      idUser: req.userId,
      after: { ...job.dataValues },
      type: 'add_job',
    };
    historyService.insertHistory(history);
    if (!job) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    return res.send(util.sendSuccess({ jobId: job.id, slug: job.slug }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getAllJobActive(req, res) {
  try {
    const queryBuilder = new QueryBuilder();
    const { skills } = req.query;
    let arrJob = [];
    const arraySort = [];
    if (skills) {
      const querySkill = skills.split(',');
      queryBuilder.where('$Skills.id$', 'in', querySkill);
    }
    queryBuilder.where('jobStatus', '=', 'Active');
    const query = queryBuilder.generateQuery();
    arrJob = await jobService.getAllJobActive(query);

    _.map(arrJob, (job) => {
      const checkJobTag = _.filter(job.Tags, (tag) => tag.title === 'Urgent');
      if (!_.isEmpty(checkJobTag)) {
        arraySort.unshift(job);
      } else {
        arraySort.push(job);
      }
      return job;
    });
    return res.send(util.sendSuccess({ list: arraySort }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getDetailJob(req, res) {
  try {
    let slugJob = req.params.slug;
    let job = await jobService.getDetailJobToSlug(slugJob);
    const arraySkillRequired = [];
    const arraySkill = [];
    let dataJob = {};
    forEach(job[0].Skills, (itemSkill) => {
      if (itemSkill.JobSkill.isRequired) {
        arraySkillRequired.push(itemSkill.name);
      } else {
        arraySkill.push(itemSkill.name);
      }
    });
    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    dataJob.id = job[0].id;
    dataJob.title = job[0].title;
    dataJob.slug = job[0].slug;
    dataJob.content = job[0].content;
    dataJob.type = job[0].type;
    dataJob.salary = job[0].salary;
    dataJob.jobStatus = job[0].jobStatus;
    dataJob.aboutFetch = job[0].aboutFetch;
    dataJob.responsibilities = job[0].responsibilities;
    dataJob.requirement = job[0].requirement;
    dataJob.niceToHave = job[0].niceToHave;
    dataJob.benefit = job[0].benefit;
    dataJob.time = job[0].time;
    dataJob.metaJob = job[0].metaJob;
    dataJob.titlePage = job[0].titlePage;
    dataJob.arr_skill_required = arraySkillRequired;
    dataJob.arr_skill = arraySkill;
    dataJob.location = job[0].Location;
    dataJob.client = job[0].Client;
    dataJob.keyword = job[0].keyword;
    dataJob.note = job[0].note;
    return res.send(util.sendSuccess(dataJob));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getJobToLocation(req, res) {
  try {
    const { idLocation } = req.params;
    const { skills } = req.query;
    const queryBuilder = new QueryBuilder();
    let location = await locationService.checkLocation(idLocation);
    if (!location) {
      return res.send(util.sendError(400, 'LocationId is not exist', 'Job not found'));
    }

    if (idLocation) {
      queryBuilder.where('locationId', '=', idLocation);
    }
    if (skills) {
      const querySkill = skills.split(',');
      queryBuilder.where('$Skills.id$', 'in', querySkill);
    }
    queryBuilder.where('jobStatus', '=', 'Active');

    const query = queryBuilder.generateQuery();
    let jobs = await jobService.getJobToLocation(query);
    const arraySort = [];
    _.map(jobs, (job) => {
      const checkJobTag = _.filter(job.Tags, (tag) => tag.title === 'Urgent');
      if (!_.isEmpty(checkJobTag)) {
        arraySort.unshift(job);
      } else {
        arraySort.push(job);
      }
      return job;
    });

    return res.send(util.sendSuccess({ jobs: arraySort }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getJobRelation(req, res) {
  try {
    const { slugJob } = req.params;
    let jobs = await jobService.getJobRelation(slugJob);
    return res.send(util.sendSuccess({ jobs }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getListJobAdmin(req, res) {
  try {
    const {
      pageSize,
      pageNumber,
      status,
      title,
    } = req.query;
    const jobs = await jobService.getListJobAdmin(pageSize, pageNumber, status, title);
    return res.send(util.sendSuccess(jobs));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getDetailJobAdmin(req, res) {
  try {
    const { id } = req.params;
    let job = await jobService.getDetailJob(id);
    const arraySkillRequired = [];
    const arraySkill = [];
    const arrayUser = [];
    const arrayTag = [];
    let dataJob = {};
    forEach(job.Skills, (itemSkill) => {
      if (itemSkill.JobSkill.isRequired) {
        arraySkillRequired.push({ id: itemSkill.id, name: itemSkill.name });
      } else {
        arraySkill.push({ id: itemSkill.id, name: itemSkill.name });
      }
    });

    forEach(job.Users, (itemUser) => {
      arrayUser.push({ id: itemUser.id, name: itemUser.name });
    });

    forEach(job.Tags, (tag) => {
      arrayTag.push({ value: tag.id, label: tag.title });
    });

    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    dataJob.id = job.id;
    dataJob.title = job.title;
    dataJob.slug = job.slug;
    dataJob.content = job.content;
    dataJob.type = job.type;
    dataJob.salary = job.salary;
    dataJob.jobStatus = job.jobStatus;
    dataJob.aboutFetch = job.aboutFetch;
    dataJob.responsibilities = job.responsibilities;
    dataJob.requirement = job.requirement;
    dataJob.niceToHave = job.niceToHave;
    dataJob.benefit = job.benefit;
    dataJob.time = job.time;
    dataJob.metaJob = job.metaJob;
    dataJob.titlePage = job.titlePage;
    dataJob.arr_skill_required = arraySkillRequired;
    dataJob.arr_skill = arraySkill;
    dataJob.location = job.Location.name;
    dataJob.locationId = job.Location.id;
    dataJob.client = job.Client;
    dataJob.keyword = job.keyword;
    dataJob.descJob = job.descJob;
    dataJob.interviewProcess = job.interviewProcess;
    dataJob.extraBenefit = job.extraBenefit;
    dataJob.note = job.note;
    dataJob.client = job.Client;
    dataJob.description = job.description;
    dataJob.user = arrayUser;
    dataJob.externalRecruiter = job.externalRecruiter;
    dataJob.token = job.Client ? job.Client.token : null;
    dataJob.tags = arrayTag;
    return res.send(util.sendSuccess(dataJob));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
// update trạng thái job nhé.
async function updateActiveJob(req, res) {
  try {
    const { id } = req.params;
    const { jobStatus } = req.body;
    let job = await jobService.updateActiveJob(jobStatus, id);
    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    return res.status(200).send(util.sendSuccess({ jobId: job.id }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
// update job nè!
async function updateJob(req, res) {
  try {
    const { id } = req.params;
    let data = req.body;
    slug.charmap['/'] = '-';
    let slugJob = slug(`${req.body.title} ${uniqueString()}`);
    data.userId = req.userId;
    data.slug = slugJob;
    // let [user, curentJob] = await Promise.all(
    //   [userService.getUserById(req.userId), jobService.getDetailJobRaw(id)],
    // );
    let curentJob = await jobService.getDetailJobRaw(id);
    let job = await jobService.updateJob(data, id);
    let updatedJob = await jobService.getDetailJobRaw(id);
    let history = {
      content: `has add update a job: ${job.title}`,
      idJob: job.id,
      idUser: req.userId,
      before: { ...curentJob.dataValues },
      after: { ...updatedJob.dataValues },
      type: 'update_job',
    };
    const diffJob = await diff(curentJob, updatedJob);
    console.log(diffJob);
    let result = [];
    diffJob.forEach((e) => {
      if (e.path.includes('title')) { // thay doi ten candidata
        result.push({
          path: 'Title job',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('Location.name')) { // thay doi location
        result.push({
          path: 'Location',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('Client.name')) { // thay doi client
        result.push({
          path: 'Client',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('type')) { // thay doi type job
        result.push({
          path: 'Type job',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('salary')) { // thay doi type job
        result.push({
          path: 'Salary',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('time')) { // thay doi type job
        result.push({
          path: 'Time',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('keyword')) { // thay doi type job
        result.push({
          path: 'Keyword',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('note')) { // thay doi type job
        result.push({
          path: 'Note',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('aboutFetch')) { // thay doi type job
        result.push({
          path: 'About Fetch',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('responsibilities')) { // thay doi type job
        result.push({
          path: 'Responsibilities',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('requirement')) { // thay doi type job
        result.push({
          path: 'Requirement',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('niceToHave')) { // thay doi type job
        result.push({
          path: 'Nice To Have',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('benefit')) { // thay doi type job
        result.push({
          path: 'Benefit',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('metaJob')) { // thay doi type job
        result.push({
          path: 'MetaJob',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('titlePage')) { // thay doi type job
        result.push({
          path: 'Title Page',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('descJob')) { // thay doi type job
        result.push({
          path: 'DescJob',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('interviewProcess')) { // thay doi type job
        result.push({
          path: 'Interview Process',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      } else if (e.path.includes('extraBenefit')) { // thay doi type job
        result.push({
          path: 'Extra Benefit',
          lhs: e.lhs,
          rhs: e.rhs,
        });
      }
    });
    history.content = JSON.stringify(result);
    historyService.insertHistory(history);
    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    // add tag for job
    await jobService.updateTagForJob(job.id, data.tags);

    return res.status(200).send(util.sendSuccess({ jobId: job.id }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
// xoa job, khong su dung nhe!
async function deleteJob(req, res) {
  try {
    const { id } = req.params;
    const job = await jobService.deleteJob(id);
    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    return res.status(200).send(util.sendSuccess({ jobId: job.id }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
async function getListJobSearch(req, res) {
  try {
    const listJob = await jobService.getListJobSearch();
    return res.status(200).send(util.sendSuccess({ listJob }));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}
// lấy ra list job cho dashboard
// eslint-disable-next-line consistent-return
async function getListJobDashBoard(req, res) {
  try {
    const { userId, roleId } = req;
    const {
      pageSize,
      pageNumber, status, startDate, endDate,
    } = req.query;
    let startDateFormat = null;
    let endDateFormat = null;
    if (startDate && endDate) {
      startDateFormat = moment(new Date(startDate)).format('YYYY-MM-DD 00:00:00');
      endDateFormat = moment(new Date(endDate)).add(1, 'days').format('YYYY-MM-DD 00:00:00');
    }
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) { // role Director
      let dataJob = [];
      let jobs = await jobService.getListJobDashBoard(
        pageSize, pageNumber, status, startDateFormat, endDateFormat,
      );
      forEach(jobs.list, async function (item) {
        let done = this.async();
        let obj = {};
        obj.clientName = item.Job.clientId ? item.Job.Client.name : '';
        obj.id = item.Job.id;
        obj.title = item.Job.title;
        obj.type = item.Job.type;
        obj.jobStatus = item.Job.jobStatus;
        obj.salary = item.Job.salary;
        obj.numberCandidate = Object.keys(item.Job.CandidateJobs).length;
        obj.follower = 0;
        obj.follower = await jobService.countJobActiveById(item.Job.id);
        obj.nameTeam = await userService.getNameTeamUser(item.userId);
        dataJob.push(obj);
        done();
      }, () => res.status(200).send(util.sendSuccess({ total: jobs.total, list: dataJob })));
    } else if (role.name === ROLE_LEADER) { // Role Leader
      let dataJob = [];
      let jobs = await jobService.leaderGetListJobDashBoard(
        userId, pageSize,
        pageNumber, status, startDateFormat, endDateFormat,
      );
      let teamName = await userService.getNameTeamUser(userId);
      // return res.status(200).send(util.sendSuccess({ total: jobs.total, list: jobs }));
      forEach(jobs.list, async function (item) {
        console.log(item.Job.Client);
        let done = this.async();
        let obj = {};
        obj.clientName = item.Job.clientId ? item.Job.Client.name : '';
        obj.id = item.Job.id;
        obj.title = item.Job.title;
        obj.type = item.Job.type;
        obj.jobStatus = item.Job.jobStatus;
        obj.salary = item.Job.salary;
        obj.numberCandidate = Object.keys(item.Job.CandidateJobs).length;
        obj.follower = 0;
        obj.nameTeam = teamName;
        obj.follower = await jobService.countJobActiveById(item.Job.id);
        dataJob.push(obj);
        done();
      }, () => res.status(200).send(util.sendSuccess({ total: jobs.total, list: dataJob })));
    } else {
      let dataJob = [];
      let jobs = await jobService.memberGetListJobDashBoard(
        userId, pageSize,
        pageNumber, status, startDateFormat, endDateFormat,
      );
      let teamName = await userService.getNameTeamUser(userId);
      forEach(jobs.list, async function (item) {
        let done = this.async();
        let obj = {};
        obj.clientName = item.Job.clientId ? item.Job.Client.name : '';
        obj.id = item.Job.id; // đây là id của job nhé
        obj.title = item.Job.title;
        obj.type = item.Job.type;
        obj.jobStatus = item.Job.jobStatus;
        obj.salary = item.Job.salary;
        obj.numberCandidate = Object.keys(item.Job.CandidateJobs).length;
        obj.follower = 0;
        obj.nameTeam = teamName;
        obj.follower = await jobService.countJobActiveById(item.Job.id);
        dataJob.push(obj);
        done();
      }, () => res.status(200).send(util.sendSuccess({ total: jobs.total, list: dataJob })));
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
async function getjobActive(req, res) {
  try {
    let jobs = await jobService.getJobActiveTrello();
    return res.status(200).send(util.sendSuccess({ arrJob: jobs }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
// thêm user assign vào job
async function assignmentJob(req, res) {
  const { idJob } = req.params;
  const { userId } = req.body;

  let userAssign = await userService.getUserCheck(userId);
  // nếu assign cho leader team khác thì clear những leader, member đã được assign
  if (userAssign.Role.name === ROLE_LEADER) {
    try {
      // await jobService.leaderClearAssign(idJob); // xoa het cac member duoc assign
      let userPromise = userService.getUserById(userId);

      let job = await jobService.checkJob(idJob);
      let codeBitly = nanoid(10);
      let slugJob = `${slug(job.title)}-${codeBitly}-${job.id}`;
      let urlLong = `${config.app.linkFetchTech}${slugJob}`;
      let url = await bitly.genUrlShort(urlLong);
      let leaderAssignPromise = jobService.leaderAssignLeader(
        userId, idJob, url.id, url.link, codeBitly,
      );
      let user = await userPromise;
      let leaderAssign = await leaderAssignPromise;
      let result = {
        User: {
          name: user.name,
          linkAvatar: user.linkAvatar,
        },
        userId: leaderAssign.userId,
        jobId: leaderAssign.jobId,
        urlShort: leaderAssign.urlShort,
        idUrlShort: leaderAssign.idUrlShort,
        totalClick: 0,
        numberCandidate: 0,
        // isReload: true, // cho frontend biết phải load lại nếu assign cho leader team khac
      };
      return res.send(util.sendSuccess({ result }));
    } catch (err) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
    }
  } else {
    slug.charmap['/'] = '-';
    const io = new SocketIO();
    try {
      let codeBitly = nanoid(10);
      let userPromise = userService.getUserById(userId);
      let job = await jobService.checkJob(idJob);
      let slugJob = `${slug(job.title)}-${codeBitly}-${job.id}`;
      let urlLong = `${config.app.linkFetchTech}${slugJob}`;
      let checkUser = await jobService.checkAssignUser(userId, idJob);
      if (checkUser) {
        return res.send(util.sendError(400, 'User has been assigned'));
      }
      let url = await bitly.genUrlShort(urlLong);
      let data = await jobService.assignUserJob(userId, idJob, url.id, url.link, codeBitly);
      let user = await userPromise;
      let result = {
        User: {
          name: user.name,
          linkAvatar: user.linkAvatar,
        },
        userId: data.userId,
        jobId: data.jobId,
        urlShort: data.urlShort,
        idUrlShort: data.idUrlShort,
        totalClick: 0,
        numberCandidate: 0,
        isReload: false, // không cần phải reload lại
      };
      // save notification and notify
      const userSendNotification = await userService.getUserById(req.userId);
      const dataNotification = {
        userId,
        content: {
          id: job.id,
          title: job.title,
          message: `${userSendNotification.name} has added you in a job`,
        },
        type: 'assignJob',
        status: false,
      };
      const notification = await notificationService.createNotification(dataNotification);
      if (notification) {
        await io.sendNotification(userId, dataNotification);
      }
      return res.send(util.sendSuccess({ result }));
    } catch (err) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
    }
  }
}
// xóa user được assign
async function removeUserAssignJob(req, res) {
  try {
    const { userId, jobId } = req.body;
    await jobService.updateDeleteAssignUser(userId, jobId);
    return res.send(util.sendSuccess());
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

// lấy các user được assign vào job
// eslint-disable-next-line consistent-return
async function getUserAssignJob(req, res) {
  try {
    const { idJob } = req.params;
    // role Director and Leader, member
    let userAssign = await jobService.getAssignUserJob(idJob);
    const result = [];
    forEach(userAssign, async function (item) {
      let done = this.async();
      let obj = {};
      obj.id = item.id;
      obj.userId = item.userId;
      obj.jobId = item.jobId;
      obj.idUrlShort = item.idUrlShort;
      obj.urlShort = item.urlShort;
      obj.User = item.User;
      obj.isFirst = item.isFirst;
      obj.numberCandidate = item.numberCandidate;
      obj.totalClick = 0;
      if (item.idUrlShort) {
        obj.totalClick = await bitly.getClick(item.idUrlShort);
      }
      result.push(obj);
      done();
    }, () => res.send(util.sendSuccess({ result })));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

// thông tin member về job đc assign như link bitly, tổng số click
async function memberAssignJob(req, res) {
  try {
    const { userId } = req;
    const { idJob } = req.params;
    // role Director and Leader, member
    let userAssign = await jobService.menberGetAssignUserJob(userId, idJob);
    const obj = {};
    obj.id = userAssign[0].id;
    obj.userId = userAssign[0].userId;
    obj.jobId = userAssign[0].jobId;
    obj.idUrlShort = userAssign[0].idUrlShort;
    obj.urlShort = userAssign[0].urlShort;
    obj.isFirst = userAssign[0].isFirst;
    obj.numberCandidate = userAssign[0].numberCandidate;
    obj.User = userAssign[0].User;
    obj.totalClick = 0;
    if (userAssign[0].idUrlShort) {
      obj.totalClick = await bitly.getClick(userAssign[0].idUrlShort);
    }
    return res.send(util.sendSuccess(obj));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

// lấy job user được assign
async function getJobUser(req, res) {
  try {
    const { pageNumber, pageSize, id } = req.query;
    let user = await userService.getUserById(id);
    if (!user) {
      return res.send(util.sendError(404, 'User not found!'));
    }
    const role = await userService.getRoleUser(user.roleId);
    if (role.name === ROLE_LEADER) {
      let data = await jobService.leaderGetJobAssign(user.teamId, pageNumber, pageSize);
      let jobs = [];
      forEach(data.list, (item) => {
        let obj = {};
        obj.id = item.id;
        obj.title = item.title;
        obj.type = item.type;
        obj.salary = item.salary;
        obj.candidate = Object.keys(item.Candidates).length;
        obj.jobStatus = item.jobStatus;
        jobs.push(obj);
      });
      return res.send(util.sendSuccess({ total: data.total, jobs }));
    }
    if (role.name === ROLE_DIRECTOR) {
      let data = await jobService.directorGetJobAssign(pageNumber, pageSize);
      let jobs = [];
      forEach(data.list, (item) => {
        let obj = {};
        obj.id = item.id;
        obj.type = item.type;
        obj.title = item.title;
        obj.salary = item.salary;
        obj.candidate = Object.keys(item.Candidates).length;
        obj.jobStatus = item.jobStatus;
        jobs.push(obj);
      });
      return res.send(util.sendSuccess({ total: data.total, jobs }));
    }
    let data = await jobService.memberGetJobAssign(id, pageNumber, pageSize);
    let jobs = [];
    forEach(data.list, (item) => {
      let obj = {};
      obj.id = item.id;
      obj.title = item.title;
      obj.type = item.type;
      obj.salary = item.salary;
      obj.candidate = Object.keys(item.Candidates).length;
      obj.jobStatus = item.jobStatus;
      jobs.push(obj);
    });
    return res.send(util.sendSuccess({ total: data.total, jobs }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getDetailJobbyId(req, res) {
  try {
    let { id } = req.params;
    let job = await jobService.getDetailJobToId(id);
    if (!job) {
      return res.send(util.sendError(404, 'Job not found !'));
    }
    const arraySkillRequired = [];
    const arraySkill = [];
    let dataJob = {};
    forEach(job.Skills, (itemSkill) => {
      if (itemSkill.JobSkill.isRequired) {
        arraySkillRequired.push(itemSkill.name);
      } else {
        arraySkill.push(itemSkill.name);
      }
    });
    dataJob.id = job.id;
    dataJob.title = job.title;
    dataJob.type = job.type;
    dataJob.salary = job.salary;
    dataJob.jobStatus = job.jobStatus;
    dataJob.aboutFetch = job.aboutFetch;
    dataJob.responsibilities = job.responsibilities;
    dataJob.requirement = job.requirement;
    dataJob.niceToHave = job.niceToHave;
    dataJob.benefit = job.benefit;
    dataJob.time = job.time;
    dataJob.metaJob = job.metaJob;
    dataJob.titlePage = job.titlePage;
    dataJob.arr_skill_required = arraySkillRequired;
    dataJob.arr_skill = arraySkill;
    dataJob.location = job.Location;
    dataJob.client = job.Client;
    dataJob.description = job.description;
    dataJob.externalRecruiter = job.externalRecruiter;
    dataJob.tags = job.Tags;
    return res.send(util.sendSuccess(dataJob));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getJobRelationToId(req, res) {
  try {
    const { id } = req.params;
    let jobs = await jobService.getJobRelationToId(id);
    return res.send(util.sendSuccess({ jobs }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
// eslint-disable-next-line consistent-return
async function genPdfJob(req, res) {
  try {
    const { id } = req.params;
    let response = await jobService.getDetailJob(id);

    let context = {
      title: response.title,
      salary: response.salary,
      address: response.content,
      time: response.time,
      content: response.aboutFetch + response.Client.about
        + response.responsibilities + response.requirement
        + response.niceToHave + response.benefit,
    };
    let options = {
      format: 'A4',
      border: {
        top: '2cm',
        right: '1.9cm',
        bottom: '2cm',
        left: '3cm',
      },
    };
    let html = null;

    ejs.renderFile(`${appRoot.path}/src/templates/jobdesc.ejs`, context, (err, result) => {
      if (result) {
        html = result;
      } else {
        res.end('An error occurred');
        console.log(err);
      }
    });
    slug.charmap['/'] = '-';
    let nameFile = slug(response.title);
    pdf.create(html, options).toBuffer((err, buffer) => {
      if (err) return res.send(err);
      res.type('pdf');
      res.setHeader('Content-type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${nameFile}.pdf`);
      return res.end(buffer, 'binary');
    });
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getAllJob(req, res) {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(404).send(util.error(util.INTERNAL_SERVER_ERROR, 'Can not see token !'));
    }

    const decoded = jwt.verify(token, config.app.secretKey);
    const jobs = await jobService.getAllJobByClient(decoded.clientId);
    return res.send(util.sendSuccess({ jobs }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function allTag(req, res) {
  try {
    const tags = await tagService.getAllTag();
    return res.send(util.sendSuccess({ tags }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function nguyHiem(req, res) {
  const idJob = 'f2ab5613-ed61-4ca8-8a96-6897453346c6';
  let job = await jobService.checkJob(idJob);
  let codeBitly = nanoid(10);
  let slugJob = `${slug(job.title)}-${codeBitly}-${job.id}`;
  let urlLong = `${config.app.linkFetchTech}${slugJob}`;
  let url = await bitly.genUrlShort(urlLong);
  res.json(url);
}

module.exports = {
  postJob,
  getAllJobActive,
  getDetailJob,
  getJobToLocation,
  getJobRelation,
  getListJobAdmin,
  getDetailJobAdmin,
  updateActiveJob,
  updateJob,
  deleteJob,
  getListJobDashBoard,
  getjobActive,
  assignmentJob,
  removeUserAssignJob,
  getUserAssignJob,
  getJobUser,
  getDetailJobbyId,
  getJobRelationToId,
  memberAssignJob,
  genPdfJob,
  getListJobSearch,
  getAllJob,
  allTag,
  nguyHiem,
};
