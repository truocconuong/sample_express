const _ = require('lodash');
const { forEach } = require('async-foreach');
const moment = require('moment');
const multer = require('multer');
const stream = require('stream');
const { google } = require('googleapis');
const slug = require('slug');
const faker = require('faker');
const diff = require('deep-diff');
const cardService = require('../service/card');
const userService = require('../service/user');
const laneService = require('../service/lane');
const candidateService = require('../service/candidate');
const notificationService = require('../service/notification');
const historyService = require('../service/history');
const util = require('../common/util');
const { ROLE_DIRECTOR, ROLE_LEADER, ROLE_MEMBER } = require('../common/util');
const jobService = require('../service/job');
const SocketIO = require('../service/socket/socket');
const { configGoogleDrive } = require('../../config/global');
const cardUserService = require('../service/cardUser');
const QueryBuilder = require('../service/builder/QueryBuilder');
const { EmailService } = require('../service/email/EmailService');

let drive = google.drive('v3');

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

const upload = multer({
  fileFilter,
});

async function uploadDriver(req, res) {
console.log('chay vao here');
  const config = await configGoogleDrive();
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.send(util.sendError(400, err));
    }
    const { nameFile, idJob, field } = req.body;
    const nameFileUpload = req.file.originalname;
    const fileFormat = nameFileUpload.slice(
      nameFileUpload.lastIndexOf('.'),
      nameFileUpload.length,
    );
    let file = `${slug(nameFile)}${fileFormat}`;
    console.log(field, nameFile);
    if (field && field === 'refineCv') {
      file = `${nameFile}${fileFormat}`;
    }
    const jwtClient = new google.auth.JWT(
      config.driverAccount,
      null,
      config.driverToken,
      ['https://www.googleapis.com/auth/drive'],
      null,
    );
    const job = await jobService.checkJob(idJob);
    const folderId = config.driverFolderCv;

    // upload sub folder
    let folderUpload = '';
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
        folderUpload = createSubFolder.data.id;
        await job.update({
          folderId: folderUpload,
        });
      }
    }
    const fileMetadata = {
      name: `${file}`,
      parents: [folderUpload],
    };

    let bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    drive.files.create(
      {
        auth: jwtClient,
        resource: fileMetadata,
        media: { mimeType: req.file.mimeType, body: bufferStream },
        fields: 'id',
      },
      (error, fileResponse) => {
        if (err) {
          // Handle error
          return res.send(util.sendError(400, error));
        }
        const url = `https://drive.google.com/file/d/${fileResponse.data.id}`;
        return res.send({ fileName: url });
      },
    );
    return true;
  });
}

async function addCard(req, res) {
  try {
    const { userId, roleId } = req;
    const usersJoin = [userId];
    const data = req.body;
    // convert social;
    if (data.facebook) {
      data.facebook = await util.detectFacebookId(data.facebook);
    }
    if (data.linkedin) {
      data.linkedin = util.detectLinkedinId(data.linkedin);
    }
    if (data.skype) {
      data.skype = util.detectSkypeId(data.skype);
    }
    let jobCandidate = '';
    const item = {
      ...data,
      userCreate: userId,
    };
    let candidateId = '';
    const candidate = await candidateService.checkCandidateAndSocial(
      item.email !== '' ? item.email : 'cannot email',
      item.phone !== '' ? item.phone : 'cannot phone',
      item.facebook !== '' ? item.facebook : 'cannot facebook',
      item.linkedin !== '' ? item.linkedin : 'cannot linkedin',
      item.skype !== '' ? item.skype : 'cannot skype',
    );
    if (candidate) {
      candidateId = candidate.id;
    } else {
      const newCandidate = await candidateService.insertCandidateCard(item);
      if (newCandidate) {
        candidateId = newCandidate.id;
      }
    }
    const itemJob = {
      candidateId,
      jobId: item.idJob,
      laneId: item.laneId,
      userCreate: item.userCreate,
      approachDate: item.approachDate,
      cv: item.linkCv,
      noteApproach: item.noteApproach,
      position: item.position,
      isAddCard: true,
      linkPortfolio: item.linkPortfolio,
      // timeAddCard: new Date(),
      source: 'system',
    };
    jobCandidate = await candidateService.updateOfCreateCandidateJob(itemJob);
    if (!jobCandidate) {
      return res
        .status(500)
        .send(
          util.sendError(
            500,
            util.errorCodes.INTERNAL_SERVER_ERROR,
            'Exists card',
          ),
        );
    }
    // luu lich su
    let history = {};

    history.after = { ...jobCandidate.dataValues };
    history.idUser = userId;
    history.idCard = jobCandidate.dataValues.id;
    history.type = 'add_card';
    history.content = `has created a card: ${data.name}-${data.nameJob}`;
    historyService.insertHistory(history);

    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_MEMBER) {
      const user = await userService.getTeamOfUserById(userId);
      if (user) {
        const getAllUserTeam = await userService.getAllLeaderOfMember(userId);
        const leaders = _.filter(getAllUserTeam.Team.Users,
          (user) => user.Role.name === util.Leader);
        for (const leader of leaders) {
          if (!_.includes(usersJoin, leader.id)) {
            usersJoin.push(leader.id);
          }
        }
      }
    }
    await cardService.insertArrayUserCard(usersJoin, jobCandidate.id);
    // if (itemJob.cv) {
    //   util.readDriveAndStorageCronJob(itemJob.cv, jobCandidate.id);
    // }
    return res.send(util.sendSuccess({ candidate }));
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}


async function updateCard(req, res) {
  try {
    let data = req.body;
    data.jobId = data.idJob; // dong nay k hiu de lam gi, kb ai code =))
    if (data.facebook) {
      data.facebook = await util.detectFacebookId(data.facebook);
    }
    if (data.linkedin) {
      data.linkedin = util.detectLinkedinId(data.linkedin);
    }
    if (data.skype) {
      data.skype = util.detectSkypeId(data.skype);
    }
    const { idCard } = req.params;
    const { userId, roleId } = req;
    const usersJoin = [userId]; // lay userId nguoi tao
    const [card, curentCard] = await Promise.all([
      cardService.getCardById(idCard),
      cardService.getCardByIdRawData(idCard),
    ]);
    let history = {
      before: { ...curentCard },
      type: 'update_card',
    };
    if (_.isNil(card)) {
      return res.send(util.sendError(500, 'Card not found !'));
    }
    // send notification
    const io = new SocketIO();
    const userSendNotification = await userService.getUserById(req.userId);
    const getAllDirector = await userService.getAllDirector();
    const getAllAdmin = await userService.getAllAdmin();
    const role = await userService.getRoleUser(roleId); // lay role cua nguoi tao
    const admins = _.map(getAllAdmin, (admin) => ({
      userId: admin.id,
    }));
    const directors = _.map(getAllDirector, (director) => ({
      userId: director.id,
    }));
    const cardUsers = _.map(card.CardUsers, (cardUser) => ({
      userId: cardUser.userId,
    }));
    const userReceiverNotify = [...cardUsers, ...directors, ...admins];
    if (role.name === ROLE_MEMBER) {
      const getAllUserTeamNotify = await userService.getAllLeaderOfMember(userId);
      const leadersNotify = _.filter(getAllUserTeamNotify.Team.Users, (user) => user.Role.name === util.Leader);
      for (const leader of leadersNotify) {
        if (!_.some(userReceiverNotify, { userId: leader.id })) {
          userReceiverNotify.push({ userId: leader.id });
        }
      }
    }

    if (data.laneId) {
      await Promise.all(
        userReceiverNotify.map(async (e) => {
          if (e.userId !== req.userId) {
            let title = `${card.Candidate.name} - ${card.Job.title}`;
            if (data.laneId) {
              const getLaneEdit = await laneService.findById(data.laneId);
              title += ` From ${curentCard.Lane.nameColumn} to ${getLaneEdit.nameColumn}`;
            }
            const dataNotification = {
              userId: e.userId,
              content: {
                id: card.id,
                title,
                message: `${userSendNotification.name} has ${data.laneId ? 'moved' : 'updated'} a card`,
              },
              type: 'assignCard',
              status: false,
            };
            const notification = await notificationService.createNotification(
              dataNotification,
            );
            if (notification) {
              await io.sendNotification(e.userId, dataNotification);
            }
          }
        }),
      );
    }
    const candidate = card.Candidate;
    if (!_.isNil(data.name)) {
      await candidateService.updateCandidate(candidate.id, { name: data.name });
    }
    let isUpdateCandidate = true;
    if (data.email || data.phone) {
      const candidateCheck = await candidateService.checkAllCandidateExists(
        data.email !== '' ? data.email : 'cannot email',
        data.phone !== '' ? data.phone : 'cannot phone',
        data.facebook !== '' ? data.facebook : 'cannot facebook',
        data.linkedin !== '' ? data.linkedin : 'cannot linkedin',
        data.skype !== '' ? data.skype : 'cannot skype',
      );
      _.map(candidateCheck, (canCheck) => {
        if (canCheck.id !== candidate.id) {
          isUpdateCandidate = false;
        }
      });
      if (isUpdateCandidate) {
        const item = {
          email: data.email,
          phone: data.phone,
          facebook: data.facebook,
          linkedin: data.linkedin,
          skype: data.skype,
        };
        await candidateService.updateCandidate(candidate.id, item);
      } else {
        return res
          .status(403)
          .send(util.sendError(403, 'Cannot update candidate'));
      }
    }
    if (data.from === 'detail_job' && !card.userCreate) { // tao card tu trang job detail, check dieu kien ung vien nay chua co userCreate (khong apply qua bitly)
      data.userCreate = userId;
    } else if (data.from === 'detail_job') {
      history.type = 'add_card_job_detail'; // card den tu jobDetail
    } else if (!data.from && data.laneId) { // keo card tren broad
      history.type = 'move_card';
    } else if (data.from === 'card_trello_modal') {
      history.type = 'update_card';
    }
    // card.createCardUser
    await card.update(data);// update card
    const { listAssign } = data; // lissAssign tu jobDetail
    if (listAssign) { // chi chay vao khi add card tu jobDetail
      if (!data.isAddCard) { // add lan dau se k xoa ban ghi CardUser
        // xoa cac user truoc do cua card
        await cardUserService.deleteCardUserByCardId(idCard, listAssign);
      }
      await Promise.all(listAssign.map(async (user) => { // add user vao card tu trang job detail
        await card.createCardUser({ userId: user.userId });
      }));
    }
    if (data.isAddCard) { // tsao lai phai check cai nay =)) / detail job gui len isAddCard = true
      if (role.name === ROLE_MEMBER) {
        const user = await userService.getTeamOfUserById(userId);
        if (user) {
          const getAllUserTeam = await userService.getAllLeaderOfMember(userId);
          const leaders = _.filter(getAllUserTeam.Team.Users, (user) => user.Role.name === util.Leader);
          for (const leader of leaders) {
            if (!_.includes(usersJoin, leader)) {
              usersJoin.push(leader.id);
            }
          }
        }
      }
      // insert list user vao card user (bao gom ca nguoi tao)
      await cardService.insertArrayUserCard(usersJoin, card.id);
    }
    // luu lich su
    /* 3 TH
      - add card tu detail job
      - move card
      - update thong tin card
    */
    // check add card tu job detail
    const cardAfter = await cardService.getCardByIdRawData(idCard);
    const diffCard = await diff(curentCard, cardAfter);
    history.after = { ...cardAfter };
    // let user = await userService.getUserById(userId); // lay user update/tao card
    history.idUser = userId;
    history.idCard = idCard;
    switch (history.type) {
      case 'add_card_job_detail': {
        history.content = `has created a card ${cardAfter.Candidate.name}-${cardAfter.Job.title} from job detail page.`;
        break;
      }
      case 'update_card': {
        let result = [];
        if (diffCard) {
          diffCard.forEach((e) => {
            if (e.path.includes('Candidate') && e.path.includes('name')) { // thay doi ten candidata
              result.push({
                path: 'Candidate name',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('Candidate') && e.path.includes('phone')) {
              result.push({
                path: 'Candidate phone',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('position')) {
              result.push({
                path: 'Position',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('noteApproach')) {
              result.push({
                path: 'Approach Point',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('cv')) {
              // util.readDriveAndStorageCronJob(data.cv, idCard);
              result.push({
                path: 'Cv',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('Candidate') && e.path.includes('email')) {
              result.push({
                path: 'Email',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('Job') && e.path.includes('title')) {
              result.push({
                path: 'Job',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('Job') && e.path.includes('Location') && e.path.includes('name')) { // thay doi job -> thay doi location
              result.push({
                path: 'Location',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('Job') && e.path.includes('Client') && e.path.includes('name')) {
              result.push({
                path: 'Client',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('facebook')) {
              result.push({
                path: 'Facebook',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('linkedin')) {
              result.push({
                path: 'Linkedin',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            } else if (e.path.includes('skype')) {
              result.push({
                path: 'Skype',
                lhs: e.lhs,
                rhs: e.rhs,
              });
            }
          });
        }
        history.content = JSON.stringify(result);
        break;
      }
      case 'move_card': { // keo card tren broad
        if (diffCard) {
          const result = diffCard.find((e) => e.path.includes('nameColumn'));
          history.content = `has moved card ${cardAfter.Candidate.name}-${cardAfter.Job.title} from ${result.lhs} to ${result.rhs}.`;
        }
        break;
      }
      default:
        break;
    }

    if (history.content !== '[]') {
      historyService.insertHistory(history);
    }

    // log send notification
    if (card.referalId) {
      const emailService = new EmailService();
      const dataSendEmail = {
        referalId: card.referalId,
        candidateJobId: card.id,
      };
      emailService.triggerSendEmailRecruiterFollowCandidate(dataSendEmail);
    }

    return res.send(util.sendSuccess());
  } catch (error) {
    console.log('loigizay', error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function detailCard(req, res) {
  try {
    const { idCard } = req.params;
    const card = await cardService.getCardById(idCard);

    if (!card) {
      return res.send(util.sendError('404', 'card not found'));
    }

    return res.send(util.sendSuccess({ card }));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}



async function assignmentCard(req, res) {
  try {
    const { idCard } = req.params;
    const { userId } = req.body;
    const io = new SocketIO();
    const card = await cardService.getCardById(idCard);
    if (_.isNil(card)) {
      return res.send(util.sendError(500, 'Card not found !'));
    }
    const getAllCardUser = await cardService.getAllCardUser(card.id);

    if (_.some(getAllCardUser, { userId })) {
      return res.send(util.sendError(500, 'User exists !'));
    }
    await card.createCardUser({ userId });

    // send notification

    const userSendNotification = await userService.getUserById(req.userId);

    const dataNotification = {
      userId,
      content: {
        id: card.id,
        title: `${card.Candidate.name} - ${card.Job.title}`,
        message: `${userSendNotification.name} has added you in a card`,
      },
      type: 'assignCard',
      status: false,
    };
    const notification = await notificationService.createNotification(
      dataNotification,
    );
    if (notification) {
      await io.sendNotification(userId, dataNotification);
    }
    return res.send(util.sendSuccess());
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR, error));
  }
}

async function removeUserCard(req, res) {
  try {
    const { idCard } = req.params;
    const { userId } = req.body;
    const io = new SocketIO();
    const card = await cardService.getCardById(idCard);
    if (_.isNil(card)) {
      return res.send(util.sendError(500, 'Card not found !'));
    }

    const cardUser = await cardService.getCardUserByUserAndCardId(
      userId,
      card.id,
    );
    if (cardUser) {
      await cardUser.destroy();
    }

    // send notification
    const userSendNotification = await userService.getUserById(req.userId);
    const dataNotification = {
      userId,
      content: {
        id: card.id,
        title: card.Job.title,
        message: `${userSendNotification.name} has removed you from card`,
      },
      type: 'assignCard',
      status: false,
    };
    const notification = await notificationService.createNotification(
      dataNotification,
    );
    if (notification) {
      await io.sendNotification(userId, dataNotification);
    }
    return res.send(util.sendSuccess());
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

// eslint-disable-next-line consistent-return
async function getTotalCv(req, res) {
  try {
    const { startDate, endDate } = req.body;
    const { roleId, userId } = req;
    const role = await userService.getRoleUser(roleId);
    let startDateFormat = moment(startDate).format('YYYY-MM-DD 00:00:00');
    let endDateFormat = moment(endDate)
      .add(1, 'days')
      .format('YYYY-MM-DD 00:00:00');
    let arrResult = [];
    if (role.name === ROLE_LEADER) {
      let data = await cardService.getDataDashBoardCvLeader(
        userId,
        startDateFormat,
        endDateFormat,
      );
      forEach(data, (item) => {
        let memberTeam = item.Users.map((member) => ({
          name: member.name,
          linkAvatar: member.linkAvatar,
          totalCv: member.CandidateJobs.length, // tong cv cua member
        }));
        const reducer = (accumulator, currentValue) => accumulator + Number(currentValue.totalCv);
        let objTeam = {
          idTeam: item.id,
          name: item.name,
          memberTeam,
          total: memberTeam.reduce(reducer, 0),
        };
        arrResult.push(objTeam);
      });
      return res.send(util.sendSuccess({ list: arrResult }));
    } if (role.name === ROLE_DIRECTOR) {
      // Role Director
      let data = await cardService.getDataDashBoardCv(
        startDateFormat,
        endDateFormat,
      );

      forEach(data, (item) => { // chay qua tung team
        let memberTeam = item.Users.map((member) => ({
          name: member.name,
          linkAvatar: member.linkAvatar,
          totalCv: member.CandidateJobs.length, // tong cv cua member team do
        }));
        const reducer = (accumulator, currentValue) => accumulator + Number(currentValue.totalCv);
        let objTeam = {
          idTeam: item.id,
          name: item.name,
          memberTeam,
          total: memberTeam.reduce(reducer, 0), // tong cua 1 team
        };
        arrResult.push(objTeam);
      });
      return res.send(util.sendSuccess({ list: arrResult }));
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function listTotalCv(req, res) {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    const role = await userService.getRoleUser(user.roleId);
    let cards;
    if (role.name === ROLE_DIRECTOR) {
      cards = await cardService.getAllCards();
    } else if (role.name === ROLE_LEADER) {
      const users = await userService.getTeamOfUserById(userId);
      const userIds = _.map(users.Team.Users, (userTeam) => userTeam.id);
      cards = await cardService.getAllCardOfTeamByIds(userIds);
    } else {
      cards = await cardService.getAllCardByUserId(userId);
    }
    const getAllLanes = _.map(cards, (card) => ({
      name: card.nameColumn,
    }));

    const result = Object.values(
      getAllLanes.reduce((accumulator, currentValue) => {
        let k = `${currentValue.name}`;
        if (!accumulator[k]) accumulator[k] = { name: currentValue.name, cv: 1 };
        else accumulator[k].cv += 1;
        return accumulator;
      }, {}),
    );

    const lanes = await laneService.getListLane();

    _.map(lanes, (lane) => {
      const checkExistsLane = _.some(result, { name: lane.nameColumn });
      if (!checkExistsLane) {
        result.push({ name: lane.nameColumn, cv: 0 });
      }
    });

    return res.send(util.sendSuccess({ list: result }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function createCardFake(req, res) {
  const getAllJobs = await jobService.getAllJobActive();
  const getAllLanes = await laneService.getListLane();
  const positions = ['Senior', 'Fresher', 'Intent', 'Master'];
  const job = getAllJobs[Math.floor(Math.random() * getAllJobs.length)];
  const lane = getAllLanes[Math.floor(Math.random() * getAllLanes.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const card = {
    name: `[Faker]- ${faker.name.firstName()} ${faker.name.lastName()}`,
    approachDate: new Date(),
    linkCV: faker.internet.url(),
    nameJob: job.title,
    userCreate: 'ab3f4783-6069-4147-a16f-76e8c06ad5a0',
    laneId: lane.id,
    position,
    clientName: 'Client8',
    phone: faker.phone.phoneNumber(),
    location: job.title,
  };
  res.json(card);
}

async function listCardReCruitment(req, res) {
  const { userId, roleId } = req;
  const { pageSize, pageNumber } = req.query;
  const userIds = [];
  try {
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_LEADER) {
      const user = await userService.getTeamOfUserById(userId);
      const usersTeam = _.map(user.Team.Users, (userTeam) => userTeam.id);
      userIds.push(...usersTeam);
    } else if (role.name === ROLE_MEMBER) {
      userIds.push(userId);
    }
    const cards = await cardService.getAllCardInIds(
      userIds,
      pageSize,
      pageNumber,
    );
    return res.send(util.sendSuccess(cards));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function searchMembers(req, res) {
  const { userId, roleId } = req;
  const { search } = req.query;
  try {
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) {
      const users = await userService.searchAllLeadersAndMembers(search);
      return res.send(util.sendSuccess({ list: users }));
    }
    const leader = await userService.getUserById(userId);
    const users = await userService.getAllUserByTeamId(leader.teamId);
    return res.send(util.sendSuccess({ list: users }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function searchCards(req, res) {
  try {
    const { userId, roleId } = req;
    const userIds = [userId];
    let { search } = req.query;
    if (!search) {
      search = 'search';
    }

    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) {
      const getAllMember = await userService.diretorGetLastLoginUser();
      userIds.push(..._.map(getAllMember, (member) => member.id));
    } else if (role.name === ROLE_LEADER) {
      const users = await userService.getTeamOfUserById(userId);
      userIds.push(..._.map(users.Team.Users, (user) => user.id));
    }
    const cards = await cardService.getAllSearchCards(search, userIds);
    return res.send(util.sendSuccess({ list: cards }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllLane(req, res) {
  try {
    const allLane = await laneService.getAllLane();
    return res.send(util.sendSuccess({ list: allLane }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllCardByLaneIds(req, res) {
  try {
    let { userId, roleId } = req;
    const userIds = [];
    const {
      clientId, jobId, label, timeStart, timeEnd, laneIds,
    } = req.query;
    const userIdSearch = req.query.userId;
    if (userIdSearch) {
      const user = await userService.getUserById(userIdSearch);
      if (user) {
        userId = user.id;
        roleId = user.roleId;
      }
    }
    const queryBuilder = new QueryBuilder();
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) {
      const getAllMember = await userService.diretorGetLastLoginUser();
      userIds.push(..._.map(getAllMember, (member) => member.id));
    }
    if (role.name === ROLE_LEADER) {
      const users = await userService.getTeamOfUserById(userId);
      userIds.push(..._.map(users.Team.Users, (user) => user.id));
    } else {
      userIds.push(userId);
    }
    queryBuilder.where('storage', '=', false);
    if (clientId) {
      queryBuilder.where('$CandidateJobs.Job.Client.id$', '=', `${clientId}`);
    }
    if (jobId) {
      queryBuilder.where('$CandidateJobs.Job.id$', '=', `${jobId}`);
    }
    if (!_.isNil(timeStart) && !_.isNil(timeEnd)) {
      const addDaysTimeEnd = moment(timeEnd).add(1, 'days').format('YYYY-MM-DD');
      queryBuilder.where('$CandidateJobs.createdAt$', 'between', [timeStart, addDaysTimeEnd]);
    }
    if (label) {
      const labelIds = await cardService.getAllLabelIds(label);
      const ids = _.map(labelIds, (itemLabel) => itemLabel.candidateJobId);
      queryBuilder.where('$CandidateJobs.id$', 'in', ids);
    }
    const query = queryBuilder.generateQuery();
    const newLaneIds = laneIds.split(',');
    const cards = await cardService.getAllCardByLaneIds(query, newLaneIds, userIds, role.name);
    _.map(cards, (card) => {
      // eslint-disable-next-line no-param-reassign
      card.dataValues.CandidateJobs = _.take(card.CandidateJobs, 5);
      return card;
    });
    const orderCard = _.orderBy(cards, ['order'], ['asc']);
    return res.send(util.sendSuccess({ list: orderCard }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllCard(req, res) {
  try {
    let { userId, roleId } = req;
    const userIds = [];
    const {
      clientId, jobId, label, timeStart, timeEnd,
    } = req.query;
    const userIdSearch = req.query.userId;
    if (userIdSearch) {
      const user = await userService.getUserById(userIdSearch);
      if (user) {
        userId = user.id;
        roleId = user.roleId;
      }
    }
    const queryBuilder = new QueryBuilder();
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) {
      const getAllMember = await userService.diretorGetLastLoginUser();
      userIds.push(..._.map(getAllMember, (member) => member.id));
    }
    if (role.name === ROLE_LEADER) {
      const users = await userService.getTeamOfUserById(userId);
      userIds.push(..._.map(users.Team.Users, (user) => user.id));
    } else {
      userIds.push(userId);
    }
    queryBuilder.where('storage', '=', false);
    if (clientId) {
      queryBuilder.where('$CandidateJobs.Job.Client.id$', '=', `${clientId}`);
    }
    if (jobId) {
      queryBuilder.where('$CandidateJobs.Job.id$', '=', `${jobId}`);
    }

    if (!_.isNil(timeStart) && !_.isNil(timeEnd)) {
      const addDaysTimeEnd = moment(timeEnd).add(1, 'days').format('YYYY-MM-DD');
      queryBuilder.where('$CandidateJobs.createdAt$', 'between', [timeStart, addDaysTimeEnd]);
    }

    if (label) {
      const labelIds = await cardService.getAllLabelIds(label);
      const ids = _.map(labelIds, (itemLabel) => itemLabel.candidateJobId);
      queryBuilder.where('$CandidateJobs.id$', 'in', ids);
    }
    const query = queryBuilder.generateQuery();

    const cards = await cardService.getAllCardNewVersion(query, userIds, role.name);
    _.map(cards, (card) => {
      // eslint-disable-next-line no-param-reassign
      card.dataValues.CandidateJobs = _.take(card.CandidateJobs, 4);
      return card;
    });
    const orderCard = _.orderBy(cards, ['order'], ['asc']);
    return res.send(util.sendSuccess({ list: orderCard }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function getAllCardsLane(req, res) {
  try {
    let { userId, roleId } = req;
    const userIds = [];
    const {
      clientId, jobId, label, timeStart, offset, timeEnd,
    } = req.query;
    const { id } = req.params;
    const userIdSearch = req.query.userId;
    if (userIdSearch) {
      const user = await userService.getUserById(userIdSearch);
      if (user) {
        userId = user.id;
        roleId = user.roleId;
      }
    }
    const queryBuilder = new QueryBuilder();
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_DIRECTOR) {
      const getAllMember = await userService.diretorGetLastLoginUser();
      userIds.push(..._.map(getAllMember, (member) => member.id));
    }
    if (role.name === ROLE_LEADER) {
      const users = await userService.getTeamOfUserById(userId);
      userIds.push(..._.map(users.Team.Users, (user) => user.id));
    } else {
      userIds.push(userId);
    }
    queryBuilder.where('storage', '=', false);
    if (id) {
      queryBuilder.where('laneId', '=', id);
    }
    if (clientId) {
      queryBuilder.where('$CandidateJobs.Job.Client.id$', '=', `${clientId}`);
    }
    if (jobId) {
      queryBuilder.where('jobId', '=', `${jobId}`);
    }
    if (!_.isNil(timeStart) && !_.isNil(timeEnd)) {
      queryBuilder.where('createdAt', 'between', [timeStart, timeEnd]);
    }
    if (label) {
      const labelIds = await cardService.getAllLabelIds(label);
      const ids = _.map(labelIds, (itemLabel) => itemLabel.candidateJobId);
      queryBuilder.where('$CandidateJobs.id$', 'in', ids);
    }
    const query = queryBuilder.generateQuery();
    const cards = await cardService.getAllCardsLane(query, offset, userIds);
    return res.send(util.sendSuccess({ list: cards }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function createLabel(req, res) {
  const data = req.body;
  try {
    const label = await cardService.createLabel(data);
    return res.send(util.sendSuccess({ label }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function removeLabel(req, res) {
  const { id } = req.params;
  try {
    const label = await cardService.removeLabel(id);
    return res.send(util.sendSuccess({ label }));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function createComment(req, res) {
  const { cardId } = req.params;
  const { userId } = req;
  const item = {
    candidateJobId: cardId,
    content: req.body.content,
    userId,
  };
  try {
    const comment = await cardService.createCommentCard(item);
    return res.send(util.sendSuccess({ comment }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getCommentCard(req, res) {
  const { cardId } = req.params;
  try {
    const comment = await cardService.getCommentOfCard(cardId);
    return res.send(util.sendSuccess({ list: comment }));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function destroyCommentCard(req, res) {
  const { commentId } = req.params;
  try {
    const comment = await cardService.destroyCommentOfCard(commentId);
    return res.send(util.sendSuccess({ comment }));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateCommentCard(req, res) {
  const { commentId } = req.params;
  const item = {
    content: req.body.content,
  };
  try {
    const comment = await cardService.updateCommentOfCard(commentId, item);
    return res.send(util.sendSuccess({ comment }));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllLabel(req, res) {
  try {
    const labels = await cardService.getAllLabel();
    const listLabelFilter = _.uniqBy(labels, 'title');
    return res.send(util.sendSuccess({ list: listLabelFilter }));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function listCardForNewAdmin(req, res) {
  const { pageSize, pageNumber, laneName } = req.query;
  try {
    const cards = await cardService.getCardsByLane(
      laneName,
      pageSize,
      pageNumber,
    );
    return res.send(util.sendSuccess(cards));
  } catch (error) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  updateCard,
  // listCards,
  addCard,
  assignmentCard,
  removeUserCard,
  detailCard,
  getTotalCv,
  uploadDriver,
  listTotalCv,
  createCardFake,
  listCardReCruitment,
  // getLaneCard,
  // getLaneCardDetail,
  searchMembers,
  searchCards,
  // current just use two func
  getAllCard,
  getAllLane,
  getAllCardsLane,
  createLabel,
  removeLabel,
  createComment,
  getCommentCard,
  destroyCommentCard,
  updateCommentCard,
  getAllLabel,
  listCardForNewAdmin,
  getAllCardByLaneIds,
};
