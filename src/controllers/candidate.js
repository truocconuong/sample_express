const { forEach } = require('async-foreach');
const moment = require('moment');
const path = require('path');
const multer = require('multer');
const stream = require('stream');
const { google } = require('googleapis');
const slug = require('slug');
const appRoot = require('app-root-path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const candidateService = require('../service/candidate');
const userService = require('../service/user');
const cardService = require('../service/card');
const jobService = require('../service/job');
const roleService = require('../service/role');
const util = require('../common/util');
const { checkEmail, checkPhone } = require('../common/validate');
const { ROLE_LEADER, ROLE_MEMBER, ROLE_DIRECTOR } = require('../common/util');
const { configGoogleDrive } = require('../../config/global');
const QueryBuilder = require('../service/builder/QueryBuilder');
// const job = require('../service/job');
const notificationService = require('../service/notification');
const SocketIO = require('../service/socket/socket');
const { testHandleExtractPdf } = require('../service/resume-pdf/extract');
const configSv = require('../../config');

let drive = google.drive('v3');
// upload file
const fileFilter = (req, file, cb) => {
  let math = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (math.indexOf(file.mimetype) === -1) {
    let errorMess = `The file ${file.originalname} is invalid. Only allowed to upload file pdf, doc or docx`;
    return cb(errorMess, false);
  }
  return cb(null, true);
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },

  // By default, multer removes file extensions so let's add them back
  filename(req, file, cb) {
    cb(null, util.generatePathPdf(req.body.name, req.body.idJob));
  },
});

const upload = multer({
  fileFilter,
  storage,
}).single('file');

async function postCandidate(req, res) {
  const config = await configGoogleDrive();
  upload(req, res, async (err) => {
    if (err) {
      return res.send(util.sendError(400, err));
    }
    let {
      nameFile,
      name,
      email,
      phone,
      message,
      idJob,
      skill,
      codeBitly,
      linkPortfolio,
      userId,
    } = req.body;
    if (
      req.body.name === ''
      || req.body.name === undefined
      || req.body.name.length > 40
    ) {
      return res.send(util.sendError(400, 'Invalid Name'));
    }
    // check userReferal is exists
    if (userId) {
      const userReferal = await userService.findById(userId);
      if (!userReferal) {
        userId = null;
      }
    }
    if (!checkEmail(req.body.email)) {
      return res.send(util.sendError(400, 'Invalid Email'));
    }
    if (!checkPhone(req.body.phone)) {
      return res.send(util.sendError(400, 'Invalid Phone'));
    }
    if (req.body.idJob === '' || req.body.idJob === undefined) {
      return res.send(util.sendError(400, 'Invalid Job'));
    }
    let skillData = JSON.stringify(skill);
    const nameFileUpload = req.file.originalname;
    const fileFormat = nameFileUpload.slice(
      nameFileUpload.lastIndexOf('.'),
      nameFileUpload.length,
    );
    const file = `${slug(nameFile)}${fileFormat}`;

    const jwtClient = new google.auth.JWT(
      config.driverAccount,
      null,
      config.driverToken,
      ['https://www.googleapis.com/auth/drive'],
      null,
    );

    const checkJob = await jobService.checkJob(idJob);

    const folderId = config.driverFolderCv;
    // upload sub folder
    let folderUpload = '';
    if (checkJob) {
      if (checkJob.folderId) {
        folderUpload = checkJob.folderId;
      } else {
        const metaCreateSubFolder = {
          name: checkJob.title,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId],
        };
        const createSubFolder = await drive.files.create({
          auth: jwtClient,
          resource: metaCreateSubFolder,
          fields: 'id',
        });
        folderUpload = createSubFolder.data.id;
        await checkJob.update({
          folderId: folderUpload,
        });
      }
    }

    const fileMetadata = {
      name: `${file}`,
      parents: [folderUpload],
    };
    const readFile = fs.readFileSync(req.file.path);
    let bufferStream = new stream.PassThrough();
    bufferStream.end(readFile);
    const fileResponse = await drive.files.create({
      auth: jwtClient,
      resource: fileMetadata,
      media: { mimeType: req.file.mimeType, body: bufferStream },
      fields: 'id',
    });
    let url = `https://drive.google.com/file/d/${fileResponse.data.id}`;
    try {
      const data = {
        name,
        email,
        phone,
        skill: skillData || '',
        message,
        idJob,
        cv: url,
        linkPortfolio,
        codeBitly,
      };
      // send notification
      // CV den tu trang chu
      const [memberId, roleIdLeader] = await Promise.all([
        userService.getUSerByCodeBitly(codeBitly),
        roleService.getRoleMember('Leader'),
      ]);
      if (memberId) {
        // neu job den tu link share
        const [listUserAssginJob, job] = await Promise.all([
          jobService.getAssignUserJobNoti(
            idJob,
            memberId.userId,
            roleIdLeader[0].id,
          ),
          jobService.checkJob(idJob),
        ]);
        // console.log(listUserAssginJob, "hihih")
        const io = new SocketIO();

        // appen;
        const getAllDirector = await userService.getAllDirector();
        const directors = _.map(getAllDirector, (director) => ({
          userId: director.id,
        }));
        const userJobs = _.map(listUserAssginJob, (userJob) => ({
          userId: userJob.userId,
        }));
        const userReceiverNotify = [...userJobs, ...directors];
        console.log('quadeovl', userReceiverNotify);
        await Promise.all(
          userReceiverNotify.map(async (e) => {
            // console.log("deo vao day a", e.userId)
            const dataNotification = {
              userId: e.userId,
              content: {
                id: idJob,
                title: job.title,
                message: `${name} has apply ${job.title}`,
              },
              type: 'assignJob',
              status: false,
            };
            const notification = await notificationService.createNotification(
              dataNotification,
            );
            if (notification) {
              await io.sendNotification(e.userId, dataNotification);
            }
          }),
        );
      } else {
        const [listUserAssginJob, job] = await Promise.all([
          jobService.getAssignUserJobNoti(idJob, '', roleIdLeader[0].id),
          jobService.checkJob(idJob),
        ]);
        // console.log(listUserAssginJob, "hihih")
        const io = new SocketIO();

        // appen;
        const getAllDirector = await userService.getAllDirector();
        const directors = _.map(getAllDirector, (director) => ({
          userId: director.id,
        }));
        const userJobs = _.map(listUserAssginJob, (userJob) => ({
          userId: userJob.userId,
        }));
        const userReceiverNotify = [...userJobs, ...directors];
        console.log('quadeovl', userReceiverNotify);

        await Promise.all(
          userReceiverNotify.map(async (e) => {
            // console.log("deo vao day a", e.userId)
            const dataNotification = {
              userId: e.userId,
              content: {
                id: idJob,
                title: job.title,
                message: `${name} has apply ${job.title}`,
              },
              type: 'assignJob',
              status: false,
            };
            const notification = await notificationService.createNotification(
              dataNotification,
            );
            if (notification) {
              await io.sendNotification(e.userId, dataNotification);
            }
          }),
        );
      }
      // check xem candidate đến từ đâu, link bitly nào
      let check = await candidateService.checkCodeBitlyCandidate(codeBitly);
      if (check) {
        candidateService.updateBitlyCandidate(check.id);
      } else {
        data.codeBitly = 'website';
      }
      console.log('check', check);
      // check candidate da ton tai hay chua
      let candidate = await candidateService.checkCandidate(email, phone);
      let result;
      if (candidate) {
        // neu da ton tai => chi add them data vao bang candidateJob
        console.log(linkPortfolio);
        result = await candidateService.candidateHasList(
          candidate.id,
          idJob,
          url,
          linkPortfolio,
          data.codeBitly,
          check ? check.userid : null, // gui them user create la nguoi share link
        );
      } else {
        const dataCandidate = {
          ...data,
        };
        if (check) {
          dataCandidate.userCreate = check.userId;
        }
        if (userId) {
          dataCandidate.referalId = userId;
        }
        // gui them user create la nguoi share link
        result = await candidateService.insertCandidate(dataCandidate);
      }
      if (!result) {
        return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
      }

      // save to table refine pdf
      // fetch candidateJob;
      const candidateId = result.id;
      const jobId = data.idJob;
      const candidateJobDetail = await candidateService.getCandidateJob(
        candidateId,
        jobId,
      );
      // if (candidateJobDetail) {
      //   const folderStorage = `./uploads/${util.generatePathPdf(
      //     req.body.name,
      //     req.body.idJob,
      //   )}`;
      //   const dataRefine = {
      //     candidateJobId: candidateJobDetail.id,
      //     url: folderStorage,
      //     nameFile: util.generatePathPdf(req.body.name, req.body.idJob),
      //     folderId: folderUpload,
      //   };
      //   await extractPdfService.insertExtractPdf(dataRefine);
      // }

      // if is link shre

      if (memberId) {
        const candidateJobIdNew = candidateJobDetail.id;
        const getStatusPending = await candidateService.getLanePending();
        const userBitly = await userService.findById(memberId.userId);
        const userJoinCard = [];
        userJoinCard.push(
          {
            userId: userBitly.id,
          },
        );
        // update lane
        const dataUpdateCandidateJob = {
          laneId: getStatusPending.id,
          isAddCard: true,
          noteApproach: `description from ${userBitly.name}`,
          approachDate: moment()
            .add(7, 'hours')
            .format('YYYY/MM/DD'),
        };
        const newCandidateJob = await candidateService
          .updateCandidateJob(candidateJobIdNew, dataUpdateCandidateJob);
        const roleOfUserBitly = userBitly.Role;
        if (roleOfUserBitly.name === 'Member') {
          const getLeader = await userService.getLeaderOfTeam(userBitly.teamId);
          if (getLeader) {
            userJoinCard.push({
              userId: getLeader.id,
            });
          }
        }
        _.map(userJoinCard, async (user) => {
          await newCandidateJob.createCardUser({ userId: user.userId });
          return user;
        });
      }
      return res.send(util.sendSuccess({
        candidateId: result.id,
        candidateJobDetail: candidateJobDetail.id,
      }));
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send(util.error(util.INTERNAL_SERVER_ERROR, error));
    }
  });
}

async function getCandidateAdmin(req, res) {
  try {
    const { pageSize, pageNumber } = req.query;
    const candidate = await candidateService.getCandidate(pageSize, pageNumber);
    let arrayCandidate = [];
    forEach(candidate.list, (candidateItem) => {
      let { nameJob } = candidateItem;
      if (Object.keys(candidateItem.Jobs).length > 0) {
        nameJob = candidateItem.Jobs[0].title;
      }
      let objCandidate = {
        id: candidateItem.id,
        name: candidateItem.name,
        phone: candidateItem.phone,
        titleJob: nameJob,
        location: candidateItem.location,
        recordYear: candidateItem.recordYear,
        date: moment(candidateItem.createdAt)
          .add(7, 'hours')
          .format('DD/MM/YYYY h:mm A'),
      };
      arrayCandidate.push(objCandidate);
    });
    return res
      .status(200)
      .send(util.sendSuccess({ total: candidate.total, list: arrayCandidate }));
  } catch (err) {
    console.log('API error', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getDetailCandidate(req, res) {
  try {
    const { id } = req.params;
    const candidate = await candidateService.getCandidateAdminDetail(id);
    if (!candidate) {
      return res.send(util.sendError(404, 'Candidate not found !'));
    }
    let arrayJob = [];
    forEach(candidate.Jobs, (item) => {
      let temp = {};
      temp.label = item.title;
      temp.value = item.Client ? item.Client.name : '';
      temp.location = item.Location ? item.Location.name : '';
      temp.cv = item.CandidateJob ? item.CandidateJob.cv : '';
      temp.candidateJobId = item.CandidateJob ? item.CandidateJob.id : '';
      temp.candidateJob = item.CandidateJob ? item.CandidateJob : '';
      arrayJob.push(temp);
    });

    if (arrayJob.length === 0) {
      arrayJob.push({
        value: '',
        label: candidate.nameJob,
        location: '',
      });
    }
    let objCandidate = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      titleJob: candidate.nameJob,
      location: candidate.location,
      recordYear: candidate.recordYear,
      skill: candidate.skill,
      message: candidate.message,
      description: candidate.description,
      jobs: arrayJob,
      fromWhom: candidate.fromWhom,
      approachDate: candidate.approachDate,
      date: moment(candidate.createdAt)
        .add(7, 'hours')
        .format('DD/MM/YYYY h:mm A'),
    };

    return res.status(200).send(util.sendSuccess({ data: objCandidate }));
  } catch (err) {
    console.log('API error', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateCv(req, res) {
  try {
    const { id } = req.params;
    const candidate = await candidateService.getCandidateAdminDetail(id);
    if (!candidate) {
      return res.send(util.sendError(404, 'Candidate not found !', {}));
    }
    const pathFileCv = candidate.cv;
    // return res.status(200).sendFile(path.join(appRoot.path +'/'+ pathFileCv));
    return res.download(
      path.join(`${appRoot.path}/${pathFileCv}`),
      pathFileCv.split('/')[1],
    );
  } catch (err) {
    console.log('API error', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
async function previewCandidateCv(req, res) {
  try {
    const { id } = req.params;
    const candidate = await candidateService.getCandidateAdminDetail(id);
    if (!candidate) {
      return res.send(util.sendError(404, 'Candidate not found !'));
    }
    const pathFileCv = candidate.cv;
    return res.status(200).sendFile(path.join(`${appRoot.path}/${pathFileCv}`));
  } catch (err) {
    console.log('API error', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}
async function getCandidateToJob(req, res) {
  try {
    const { userId, roleId } = req;
    const { idJob } = req.params;
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_LEADER || role.name === ROLE_DIRECTOR) {
      let Candidates = await candidateService.getCandidateToJob(idJob);
      let data = [];
      forEach(Candidates, (candidate) => {
        let obj = {};
        obj.id = candidate.candidateId; // đây là id của candidate
        obj.idCandidateJob = candidate.id;
        obj.name = candidate.Candidate.name;
        obj.isAddCard = candidate.isAddCard;
        obj.date = candidate.createdAt;
        obj.colorColumn = candidate.Lane ? candidate.Lane.background : '';
        obj.nameColumn = candidate.Lane ? candidate.Lane.nameColumn : '';
        obj.follower = [];
        if (Object.keys(candidate.Users).length > 0) {
          forEach(candidate.Users, (user) => {
            obj.follower.push(user.name);
          });
        }
        data.push(obj);
      });
      return res.send(util.sendSuccess({ list: data }));
    }
    // role member
    // chi show nhung candidate tu link bitly va duoc assign
    const bitly = await userService.getBitlyCodeUser(idJob, userId);

    // console.log(bitly.codeBitly);
    let Candidates = await candidateService.getCandidateToJobMember(
      idJob,
      userId,
      bitly.codeBitly,
    );
    let data = [];
    forEach(Candidates, (candidate) => {
      let obj = {};
      obj.id = candidate.candidateId; // đây là id của candidate
      obj.idCandidateJob = candidate.id;
      obj.name = candidate.Candidate.name;
      obj.isAddCard = candidate.isAddCard;
      obj.date = candidate.createdAt;
      obj.colorColumn = candidate.Lane ? candidate.Lane.background : '';
      obj.nameColumn = candidate.Lane ? candidate.Lane.nameColumn : '';
      obj.follower = [];
      if (Object.keys(candidate.Users).length > 0) {
        forEach(candidate.Users, (user) => {
          obj.follower.push(user.name);
        });
      }
      data.push(obj);
    });

    return res.send(util.sendSuccess({ list: data }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateInterview(req, res) {
  try {
    const { idJob } = req.params;
    let data = await candidateService.getCandidateInterview(idJob);
    let candidate = [];
    forEach(data.Candidates, (item) => {
      let obj = {};
      obj.id = item.id;
      obj.email = item.email;
      obj.phone = item.phone;
      obj.title = data.title;
      obj.location = data.Location.address;
      candidate.push(obj);
    });
    return res.send(util.sendSuccess({ candidate }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateAddCard(req, res) {
  try {
    const { id } = req.params;
    const { idJob, idCandidateJob } = req.query;
    let data = await candidateService.getCandidateAddCard(
      id,
      idJob,
      idCandidateJob,
    );
    let obj = {};
    obj.idCandidateJob = data.id;
    obj.candidateId = data.candidateId;
    obj.jobId = data.jobId;
    obj.name = data.Candidate.name;
    obj.nameJob = data.Job.title;
    obj.email = data.Candidate.email;
    obj.phone = data.Candidate.phone;
    obj.cv = data.cv;
    obj.approachDate = moment(data.createdAt)
      .add(7, 'hours')
      .format('YYYY/MM/DD');
    obj.location = data.Job.Location.name || '';
    obj.nameClient = data.Job.Client ? data.Job.Client.name : '';
    obj.parserPdf = data.parserPdf;
    return res.send(util.sendSuccess(obj));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateByJob(req, res) {
  const { userId, roleId } = req;
  const { pageSize, pageNumber } = req.query;
  let idJobs = [];
  try {
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_LEADER) {
      const user = await userService.getTeamOfUserById(userId);
      user.Team.Users.map((userTeam) => idJobs.push(...userTeam.Jobs));
      idJobs = idJobs.map((job) => job.id);
    } else if (role.name === ROLE_MEMBER) {
      const user = await userService.getJobUser(userId);
      if (user.Jobs) {
        idJobs = user.Jobs.map((job) => job.id);
      }
    } else {
      const jobs = await jobService.getAllJobActive();
      idJobs = jobs.map((job) => job.id);
    }
    const candidates = await candidateService.getCandidateByJob(
      idJobs,
      pageSize,
      pageNumber,
    );
    return res.send(util.sendSuccess(candidates));
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}

async function getCandidatePopupDetail(req, res) {
  try {
    const { id } = req.params; // id card ( tức là id CandidateJob)
    let data = await candidateService.getCandidatePopup(id);
    let obj = {};
    obj.idCandidateJob = data.id;
    obj.candidateId = data.candidateId;
    obj.jobId = data.jobId;
    obj.name = data.Candidate.name;
    obj.nameJob = data.Job.title;
    obj.email = data.Candidate.email;
    obj.phone = data.Candidate.phone;
    obj.cv = data.cv;
    obj.approachDate = moment(data.createdAt)
      .add(7, 'hours')
      .format('YYYY/MM/DD');
    obj.location = data.Job.Location.name || '';
    obj.nameClient = data.Job.Client ? data.Job.Client.name : '';
    return res.send(util.sendSuccess(obj));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateOfUser(req, res) {
  try {
    const { email } = req.query;
    const candidate = await candidateService.getCandidateByEmail(email);
    return res.send(util.sendSuccess({ candidate }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateOfUserByPhone(req, res) {
  try {
    const { phone } = req.query;
    const candidate = await candidateService.getCandidateByPhone(phone);
    return res.send(util.sendSuccess({ candidate }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getCandidateSearchAdmin(req, res) {
  const queryBuilder = new QueryBuilder();
  try {
    const {
      pageSize,
      pageNumber,
      email,
      phone,
      skills,
      text,
      name,
      jobId,
    } = req.query;
    if (email) {
      queryBuilder.where('email', 'like', `${email}%`);
    }
    if (phone) {
      queryBuilder.where('phone', 'like', `${phone}%`);
    }

    if (name) {
      queryBuilder.where('name', 'like', `${name}%`);
    }

    if (skills) {
      const querySkill = skills.split(',');
      queryBuilder.where('skill', 'in', querySkill);
    }

    if (text) {
      queryBuilder.searchQueryParams(['description'], text);
    }

    // if (jobId) {
    //   queryBuilder.where('$Jobs.id$', '=', jobId);
    // }

    const query = queryBuilder.generateQuery();
    const candidate = await candidateService.getCandidateSearch(
      pageSize,
      pageNumber,
      query,
      jobId,
    );
    let arrayCandidate = [];
    forEach(candidate.list, (candidateItem) => {
      let sourceArray = [];
      let titleJobArray = [];
      let dateArray = [];
      let userArray = [];
      let laneArray = [];
      forEach(candidateItem.CandidateJobs, (candidateJobItem) => {
        if (candidateJobItem.source) {
          sourceArray.push(candidateJobItem.source);
        }
        if (candidateJobItem.isAddCard && candidateJobItem.Lane) {
          laneArray.push(candidateJobItem.Lane);
        } else {
          laneArray.push({
            nameColumn: 'Add To Boards',
            background: '#FFF4DE',
          });
        }
        titleJobArray.push(candidateJobItem.Job.title);
        if (Object.keys(candidateJobItem.Users).length > 0) {
          forEach(candidateJobItem.Users, (user) => {
            userArray.push(user.name);
          });
        }
        dateArray.push(
          moment(candidateJobItem.createdAt).format('DD/MM/YYYY h:mm A'),
        );
      });
      let objCandidate = {
        id: candidateItem.id,
        name: candidateItem.name,
        phone: candidateItem.phone,
        email: candidateItem.email,
        source: [...sourceArray],
        titleJob: [...titleJobArray],
        date: [...dateArray],
        lane: [...laneArray],
        follower: [...userArray],
      };
      arrayCandidate.push(objCandidate);
    });
    return res
      .status(200)
      .send(util.sendSuccess({ total: candidate.total, list: arrayCandidate }));
  } catch (err) {
    console.log('API error', err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

// eslint-disable-next-line consistent-return
async function getCandidateJob(req, res) {
  const { candidateId, jobId } = req.params;
  let candidateJob = await candidateService.getCandidateJob(candidateId, jobId);
  return res.status(200).send(util.sendSuccess({ candidateJob }));
}

async function makePdf(req, res) {
  let data = { ...req.body };
  const config = await configGoogleDrive();
  const candidateJob = await candidateService.getCandidateJob(
    data.candidateId,
    data.jobId,
  );
  if (candidateJob) {
    const fileDir = process.cwd();
    const dataUpdate = { ...data };
    data = JSON.parse(JSON.stringify(data).replace(/\\n/g, '<br>'));
    // import font

    data.calibriRegular = `file:///${appRoot.path}/src/templates/calibri_regular.ttf`;
    data.calibriBold = `file:///${appRoot.path}/src/templates/calibri_bold.ttf`;
    data.trebucMsBold = `file:///${appRoot.path}/src/templates/trebucms_bold.ttf`;
    data.carlitoRegular = `file:///${appRoot.path}/src/templates/carlito-regular.ttf`;

    ejs.renderFile(
      `${appRoot.path}/src/templates/resume-pdf.ejs`,
      data,
      (err, item) => {
        if (item) {
          let nameFile = candidateJob.parserPdf
            ? `${candidateJob.parserPdf}`
            : `/uploads/${util.generatePathPdf(
              candidateJob.Candidate.name,
              data.idJob,
            )}`;
          if (candidateJob.isRefinePdf) {
            nameFile = `/uploads/${util.generatePathPdf(
              candidateJob.Candidate.name,
              candidateJob.jobId,
            )}`;
          }
          let options = {
            format: 'A4',
            header: {
              height: '5mm',
            },
            footer: {
              height: '5mm',
            },
          };

          pdf
            .create(item, options)
            .toFile(`${fileDir}/${nameFile}`, async (errPdf) => {
              if (errPdf) {
                res.end('An error occurred');
              } else {
                delete dataUpdate.candidateId;
                delete dataUpdate.jobId;

                const jwtClient = new google.auth.JWT(
                  config.driverAccount,
                  null,
                  config.driverToken,
                  ['https://www.googleapis.com/auth/drive'],
                  null,
                );

                // save sub
                const folderId = config.driverFolderCv;
                let folderUpload = '';

                const job = await jobService.checkJob(data.jobId);
                // console.log(job);

                // upload sub folder
                if (job) {
                  if (job.folderId) {
                    folderUpload = job.folderId;
                  } else {
                    const metaCreateSubFolder = {
                      name: job.title,
                      mimeType: 'application/vnd.google-apps.folder',
                      parents: [folderId],
                    };
                    const createSubFolder = await drive.files.create({
                      auth: jwtClient,
                      resource: metaCreateSubFolder,
                      fields: 'id',
                    });
                    await job.update({
                      folderId: folderUpload,
                    });
                    folderUpload = createSubFolder.data.id;
                  }
                }

                const fileMetadata = {
                  name: `refine-${candidateJob.Candidate.name}.pdf`,
                  parents: [folderUpload],
                };
                const readFile = fs.readFileSync(`.${nameFile}`);
                let bufferStream = new stream.PassThrough();
                bufferStream.end(readFile);
                const fileResponse = await drive.files.create({
                  auth: jwtClient,
                  resource: fileMetadata,
                  media: { mimeType: 'application/pdf', body: bufferStream },
                  fields: 'id',
                });
                await candidateService.updateParserPdfCandidateJob(
                  req.body.candidateId,
                  req.body.jobId,
                  {
                    parserPdf: `https://drive.google.com/file/d/${fileResponse.data.id}`,
                    dataParserPdf: dataUpdate,
                    isRefinePdf: true,
                  },
                );
                res.json(candidateJob);
              }
            });
        } else {
          res.end('An error occurred');
          console.log(err);
        }
      },
    );
  }
}

async function previewPdf(req, res) {
  const { id } = req.params;
  let fileId = '';
  const config = await configGoogleDrive();
  try {
    const candidateJob = await candidateService.getCandidatePopup(id);
    if (candidateJob) {
      const { cv } = candidateJob;
      fileId = cv ? cv.slice(cv.lastIndexOf('/') + 1, cv.length) : '';
    }
    const jwtClient = new google.auth.JWT(
      config.driverAccount,
      null,
      config.driverToken,
      ['https://www.googleapis.com/auth/drive'],
      null,
    );
    await drive.files.get(
      {
        auth: jwtClient,
        fileId, // A Google Doc
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' },
      (err, dataDrive) => {
        if (!dataDrive) {
          return res
            .status(500)
            .send(util.error(util.INTERNAL_SERVER_ERROR, err));
        }
        if (err) {
          console.log(err);
        }
        let buf = [];
        dataDrive.data.on('data', (e) => {
          buf.push(e);
        });
        dataDrive.data.on('end', () => {
          const buffer = Buffer.concat(buf);
          const base64 = buffer.toString('base64');
          return res.send(util.sendSuccess({ base64 }));
        });
        return true;
      },
    );
    // const buffer = fileResponse.data._outBuffer;
  } catch (error) {
    console.log(error);
    res.json(error);
  }
}

async function previewPdfRefine(req, res) {
  const { id } = req.params;
  let fileId = '';
  const config = await configGoogleDrive();
  try {
    const candidateJob = await candidateService.getCandidatePopup(id);
    if (candidateJob) {
      const { parserPdf } = candidateJob;
      fileId = parserPdf
        ? parserPdf.slice(parserPdf.lastIndexOf('/') + 1, parserPdf.length)
        : '';
    }
    const jwtClient = new google.auth.JWT(
      config.driverAccount,
      null,
      config.driverToken,
      ['https://www.googleapis.com/auth/drive'],
      null,
    );
    await drive.files.get(
      {
        auth: jwtClient,
        fileId, // A Google Doc
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' },
      (err, dataDrive) => {
        if (!dataDrive) {
          return res
            .status(500)
            .send(util.error(util.INTERNAL_SERVER_ERROR, err));
        }
        if (err) {
          console.log(err);
        }
        let buf = [];
        dataDrive.data.on('data', (e) => {
          buf.push(e);
        });
        dataDrive.data.on('end', () => {
          const buffer = Buffer.concat(buf);
          const base64 = buffer.toString('base64');
          return res.send(util.sendSuccess({ base64 }));
        });
        return true;
      },
    );
    // const buffer = fileResponse.data._outBuffer;
  } catch (error) {
    console.log(error);
    res.json(error);
  }
}

// eslint-disable-next-line consistent-return
async function downloadPdfPrivate(req, res) {
  const { linkDrive } = req.body;
  const config = await configGoogleDrive();
  const fileId = linkDrive
    ? linkDrive.slice(linkDrive.lastIndexOf('/') + 1, linkDrive.length)
    : '';

  const jwtClient = new google.auth.JWT(
    config.driverAccount,
    null,
    config.driverToken,
    ['https://www.googleapis.com/auth/drive'],
    null,
  );
  try {
    await drive.files.get(
      {
        auth: jwtClient,
        fileId, // A Google Doc
        alt: 'media',
        supportsAllDrives: true,
      },
      { responseType: 'stream' },
      (err, dataDrive) => {
        if (!dataDrive) {
          return res
            .status(500)
            .send(util.error(util.INTERNAL_SERVER_ERROR, err));
        }
        if (err) {
          console.log(err);
        }
        let buf = [];
        dataDrive.data.on('data', (e) => {
          buf.push(e);
        });
        dataDrive.data.on('end', () => {
          const buffer = Buffer.concat(buf);
          const base64 = buffer.toString('base64');
          return res.send(util.sendSuccess({ base64 }));
        });
        return true;
      },
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, error));
  }
}

async function testRefinePdf(req, res) {
  const config = await configGoogleDrive();
  const url = './uploads/nguyen-hong-thai.pdf';
  const result = await testHandleExtractPdf(url, config);
  res.json(result);
}

async function checkExistCandidate(req, res) {
  try {
    const { email, phone, jobId } = req.body;
    const checkCandidate = await candidateService.checkExist(
      email,
      phone,
      jobId,
    );
    return res.send(util.sendSuccess({ exists: checkCandidate }));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function listCandidateRecruiter(req, res) {
  const { id } = req.params;
  try {
    const profile = await candidateService.getDetailProfileOfRecruiter(
      id,
    );
    const candidateJobs = await candidateService.getAllCandidateRecruiter(id);
    const profileCustom = {
      name: profile.name,
      email: profile.email,
      bank: {
        bankNumber: profile.BankRecruiter ? profile.BankRecruiter.bankNumber : '',
        bankName: profile.BankRecruiter ? profile.BankRecruiter.bankName : '',
        name: profile.BankRecruiter ? profile.BankRecruiter.name : '',
        urlFrontImageIdCard: profile.BankRecruiter ? profile.BankRecruiter.urlFrontImageIdCard : '',
        urlBehindImageIdCard: profile.BankRecruiter ? profile.BankRecruiter.urlBehindImageIdCard : '',

      },
      candidateJobs,
    };
    return res.send(util.sendSuccess({ profile: profileCustom }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function listCandidateRecruiterJob(req, res) {
  const { id, jobId } = req.params;
  const { pageSize, pageNumber, laneId } = req.query;
  try {
    let condition = {
      referalId: id,
      jobId,
    };
    if (laneId) {
      condition.laneId = laneId;
    }

    const recruiterCandidates = await candidateService.getAllCandidateOfRecruiterByJob(
      condition,
      pageSize,
      pageNumber,
    );
    return res.send(util.sendSuccess(recruiterCandidates));
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getAllCandidateByClientJob(req, res) {
  const { tokenClient, jobId } = req.params;
  if (!tokenClient && !jobId) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
  try {
    const verifyToken = jwt.verify(tokenClient, configSv.app.secretKey);
    const { clientId } = verifyToken;
    const verifyJobIsOfClient = await jobService.verifyJob(clientId, jobId);
    const result = [];
    if (!verifyJobIsOfClient) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    const candidates = await candidateService.getAllCandidateJob(jobId);
    _.map(candidates, (canJob) => {
      const dataSend = {
        location: canJob.Job.Location ? canJob.Job.Location.name : '',
        fullName: canJob.Candidate.name,
        candidateJobId: canJob.id,
        email: canJob.Candidate.email,
        linkCv: canJob.cv,
        zoomLink: canJob.Interview ? canJob.Interview.linkZoom : '',
        time: canJob.Interview ? canJob.Interview.timeInterview : '',
        note: canJob.noteApproach,
        status: canJob.Lane ? canJob.Lane.nameColumn : '',
        background: canJob.Lane ? canJob.Lane.background : '',
        job: canJob.Job ? canJob.Job.title : '',
        viewer: canJob.Interview ? canJob.Interview.viewer : '',
        review: canJob.Interview ? canJob.Interview.review : '',
        interviewId: canJob.Interview ? canJob.Interview.id : '',
      };
      result.push(dataSend);
      return canJob;
    });
    return res.send(util.sendSuccess({ list: result }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function getAllCandidateByClientIdJob(req, res) {
  const { clientId, jobId } = req.params;
  if (!clientId && !jobId) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
  try {
    const result = [];
    const candidates = await candidateService.getAllCandidateJobSale(jobId);
    _.map(candidates, (canJob) => {
      const dataSend = {
        location: canJob.Job.Location ? canJob.Job.Location.name : '',
        fullName: canJob.Candidate.name,
        linkCv: canJob.cv,
        zoomLink: canJob.Interview ? canJob.Interview.linkZoom : '',
        time: canJob.Interview ? canJob.Interview.timeInterview : '',
        note: canJob.noteApproach,
        status: canJob.Lane ? canJob.Lane.nameColumn : '',
        background: canJob.Lane ? canJob.Lane.background : '',
      };
      result.push(dataSend);
      return canJob;
    });
    return res.send(util.sendSuccess({ list: result }));
  } catch (err) {
    console.log(err);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

async function assignLeaderToCandidateJob(req, res) {
  const { canJobId } = req.body;
  const io = new SocketIO();
  try {
    const candidateJob = await candidateService.getCandidateJobById(canJobId);
    if (!candidateJob) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, 'err'));
    }
    const recruiter = await userService.findById(candidateJob.referalId);

    if (recruiter) {
      const { jobId } = candidateJob;

      const getAllUser = await jobService.getAllUserOfJob(jobId);

      const getStatusPending = await candidateService.getLanePending();

      // update lane
      const dataUpdateCandidate = {
        laneId: getStatusPending.id,
        isAddCard: true,
        noteApproach: `referral from ${recruiter.name}`,
        approachDate: moment()
          .add(7, 'hours')
          .format('YYYY/MM/DD'),

      };
      console.log(dataUpdateCandidate);
      await candidateService.updateCandidateJob(candidateJob.id, dataUpdateCandidate);

      const leadersJoinCard = getAllUser.Users;

      // add leader to card
      _.map(leadersJoinCard, async (leader) => {
        await candidateJob.createCardUser({ userId: leader.id });
        const dataNotification = {
          userId: leader.id,
          content: {
            id: candidateJob.id,
            title: `${candidateJob.Candidate.name} - ${candidateJob.Job.title}`,
            message: '[System] Recruiter has added you in a card',
          },
          type: 'assignCard',
          status: false,
        };
        const notification = await notificationService.createNotification(
          dataNotification,
        );
        if (notification) {
          await io.sendNotification(leader.id, dataNotification);
        }
        return leader;
      });

      // add label to card

      const getLabel = await cardService.getLabelReferral();
      if (getLabel) {
        const dataCreateLabel = {
          candidateJobId: canJobId,
          title: getLabel.title,
          background: getLabel.background,
        };
        await cardService.createLabel(dataCreateLabel);
      }
    }
    return res.send(util.sendSuccess());
  } catch (err) {
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
  }
}

module.exports = {
  postCandidate,
  getCandidateAdmin,
  getDetailCandidate,
  getCandidateCv,
  previewCandidateCv,
  getCandidateToJob,
  getCandidateInterview,
  getCandidateAddCard,
  getCandidateByJob,
  getCandidatePopupDetail,
  getCandidateOfUser,
  getCandidateSearchAdmin,
  getCandidateOfUserByPhone,
  getCandidateJob,
  makePdf,
  previewPdf,
  previewPdfRefine,
  downloadPdfPrivate,
  testRefinePdf,
  checkExistCandidate,
  listCandidateRecruiter,
  listCandidateRecruiterJob,
  getAllCandidateByClientJob,
  assignLeaderToCandidateJob,
  getAllCandidateByClientIdJob,
};
