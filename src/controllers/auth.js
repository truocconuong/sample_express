const passport = require('passport');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const _ = require('lodash');
let randomstring = require('randomstring');
const userService = require('../service/user');
const util = require('../common/util');
const config = require('../../config');
const { hash, compare } = require('../common/hash');
const { ROLE_DIRECTOR, ROLE_LEADER } = require('../common/util');
const { EmailService } = require('../service/email/EmailService');
const { syncCandidateBonusOfRecruiter } = require('../service/caculator-bonus');

const authenticateRole = (roleArray) => async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const { tokentimestamp } = req.headers;
    const decoded = jwt.verify(token, config.app.secretKey);
    const decodedTimeStamp = jwt.verify(
      tokentimestamp,
      config.app.secretKeyRefresh,
    );
    if (decoded.userId !== decodedTimeStamp.userId) {
      return res.status(401).send(util.error('Authorization', 'Logout'));
    }
    if (decoded) {
      req.userId = decoded.userId;
      req.roleId = decoded.roleId;
      const role = await userService.getRoleUser(decoded.roleId);
      const authorized = roleArray.indexOf(role.name);
      if (authorized === -1) {
        return res.status(403).send(util.error('Authorization', 'Forbidden'));
      }
      return next();
    }
    return res.status(401).send(util.error('Authorization', 'Invalid token'));
  } catch (err) {
    console.log(err);
    return res.status(401).send(util.error('Authorization', 'Invalid token'));
  }
};

async function sigin(req, res, next) {
  // passport.authenticate sẽ nhận vào callback cho method successs ở phần config passport
  passport.authenticate('local-login', async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(500).send(info);
    }
    // Sử dụng JWT để sinh ra token chứa info của user đã login
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        email: user.email,
      },
      config.app.secretKey,
    );
    let timestamp = moment(new Date()).format('x');

    // token nay dung de check login
    const tokenTimeStamp = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        timestamp,
      },
      config.app.secretKeyRefresh,
    );
    userService.updateLastLoginUser(user.id, token, tokenTimeStamp);
    // luu lich su login
    // let [userLogin, role] = await Promise.all([
    //   userService.getUserById(user.id),
    //   userService.getUserCheck(user.id)]);
    let role = await userService.getUserCheck(user.id);

    return res.send(
      util.sendSuccess({
        userId: user.id,
        roleId: user.roleId,
        role: role.Role.name,
        email: user.email,
        token,
        tokenTimeStamp,
      }),
    );
  })(req, res, next);
}

async function register(req, res) {
  try {
    const rowsEmail = await userService.checkEmail(req.body.email.trim());
    if (rowsEmail !== 0) {
      return res
        .status(409)
        .send(util.sendError(409, 'Email already exitsts!'));
    }
    const { userId } = req;
    const {
      roleId, email, name, teamId, password,
    } = req.body;
    let userCreate = await userService.getUserById(userId);
    let roleName = await userService.getRoleUser(roleId);
    let teamIdUser;
    console.log(roleName.name);
    if (roleName.name === ROLE_DIRECTOR) {
      teamIdUser = null;
    } else {
      // leader add member
      // eslint-disable-next-line no-lonely-if
      if (teamId === null) {
        teamIdUser = userCreate.teamId;
      } else {
        teamIdUser = teamId;
      }
    }
    // console.log(req.body)
    // hàm hash từ common
    const userPassword = await hash(password.toString().trim());
    const data = {
      email: email.trim(),
      password: userPassword,
      roleId,
      teamId: teamIdUser,
      name: name.trim(),
    };
    const user = await userService.insertUser(data);
    return res.send(util.sendSuccess({ userId: user.id, roleId: user.roleId }));
  } catch (e) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getListUser(req, res) {
  try {
    const { pageSize, pageNumber } = req.query;
    const { roleId, userId } = req;
    const role = await userService.getRoleUser(roleId);
    let user = [];
    if (role.name === ROLE_DIRECTOR) {
      user = await userService.getListUser(pageSize, pageNumber);
      return res.send(util.sendSuccess(user));
    }
    user = await userService.getListUserLeader(userId, pageSize, pageNumber);
    return res.send(util.sendSuccess({ total: user.count, list: user.rows }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
async function getAllUser(req, res) {
  try {
    const user = await userService.getAllUser();
    return res.send(util.sendSuccess({ user }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateUser(req, res) {
  try {
    const idUser = req.params.id;
    const data = req.body;
    let userUpdate = await userService.updateUser(idUser, data);
    if (!userUpdate) {
      return res.send(util.sendError(404, 'User not found !'));
    }
    return res.send(util.sendSuccess({ userId: userUpdate.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function updateAllDataUser(req, res) {
  try {
    const idUser = req.params.id;
    const data = req.body;
    let userUpdate = await userService.updateAllDataUser(idUser, data);
    if (!userUpdate) {
      return res.send(util.sendError(404, 'User not found !'));
    }
    return res.send(util.sendSuccess({ userId: userUpdate.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function deleteUser(req, res) {
  try {
    const idUser = req.params.id;
    let user = await userService.deleteUser(idUser);
    if (!user) {
      return res.send(util.sendError(404, 'User not found !'));
    }
    return res.send(util.sendSuccess({ userId: user.id }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getUser(req, res) {
  try {
    const { id } = req.params;
    let user = await userService.getUserById(id);
    return res.send(util.sendSuccess({ user }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getLastLogin(req, res) {
  try {
    const { roleId, userId } = req;
    const role = await userService.getRoleUser(roleId);
    let arrData;
    if (role.name === ROLE_DIRECTOR) {
      let data = await userService.diretorGetLastLoginUser();
      arrData = data.map((item) => {
        let obj = {};
        obj.id = item.id;
        obj.name = item.name;
        obj.linkAvatar = item.linkAvatar;
        obj.lastLogin = item.lastLogin
          ? moment(item.lastLogin)
            .utcOffset('+07:00')
            .format('DD/MM/YYYY hh:mm A')
          : '';
        return obj;
      });
      return res.send(util.sendSuccess({ list: arrData }));
    }
    let data = await userService.leaderGetLastLoginUser(userId);
    arrData = data.map((item) => {
      let obj = {};
      obj.id = item.id;
      obj.name = item.name;
      obj.linkAvatar = item.linkAvatar;
      obj.lastLogin = item.lastLogin
        ? moment(item.lastLogin)
          .utcOffset('+07:00')
          .format('DD/MM/YYYY hh:mm A')
        : '';
      return obj;
    });
    return res.send(util.sendSuccess({ list: arrData }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getUserTrello(req, res) {
  try {
    const { userId, roleId } = req;
    let arrData = [];
    const role = await userService.getRoleUser(roleId);

    if (role.name === ROLE_LEADER) {
      let user = await userService.getUserById(userId);
      arrData = await userService.leaderGetUserTrello(user.teamId);
      const leaders = await userService.getAllLeader();
      arrData = [...arrData, ...leaders];
      if (arrData) {
        arrData = _.filter(arrData, (data) => data.id !== userId);
      }
    } else if (role.name === ROLE_DIRECTOR) {
      arrData = [];
    } else {
      arrData = await userService.getAllLeader();
    }
    // Role Leader
    return res.send(util.sendSuccess({ list: arrData }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function checkBrowser(req, res) {
  const { tokenTimeStamp } = req.body;
  const decoded = jwt.verify(tokenTimeStamp, config.app.secretKeyRefresh);
  if (decoded) {
    let { userId } = decoded;
    let user = await userService.getUserCheck(userId);
    userService.saveLastLogin(userId);
    return res.status(200).send(
      util.sendSuccess({
        tokenAuth: user.tokenAuth,
        role: user.Role.name,
        userId: user.id,
      }),
    );
  }
  return res.status(401).send(util.error('Authorization', 'Invalid token'));
}

async function getUserTask(req, res) {
  try {
    const { userId } = req;
    let arrData = [];
    // Role Leader
    let user = await userService.getUserById(userId);
    arrData = await userService.leaderGetUserTask(user.teamId, userId);
    return res.send(util.sendSuccess({ list: arrData }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getProfile(req, res) {
  try {
    const { userId } = req;
    console.log(userId);
    let user = await userService.getProfileUser(userId);
    if (!_.isEmpty(user.Notifications) && user.Notifications) {
      let totalMessageNotSend = 0;
      const countNotificationNotSeen = _.filter(
        user.Notifications,
        (notification) => notification.status === false,
      );
      if (countNotificationNotSeen) {
        totalMessageNotSend = countNotificationNotSeen.length;
        user.dataValues.countNotificationNotSeen = totalMessageNotSend;
      }
    }
    return res.send(util.sendSuccess({ user }));
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

let storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads');
  },
  filename(req, file, cb) {
    let filename = `${Date.now()}-hoangkhanhdev-${file.originalname}`;
    return cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  let math = ['image/png', 'image/jpeg', 'image/jpg'];
  if (math.indexOf(file.mimetype) === -1) {
    let errorMess = `The file ${file.originalname} is invalid. Only allowed to upload file png, jpeg and jpg`;
    return cb(errorMess, false);
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
}).single('linkAvatar');

const mulUploadCmnd = multer({
  storage,
  fileFilter,
}).single('linkCmnd');

async function uploadAvatar(req, res) {
  const { userId } = req;
  upload(req, res, async (err) => {
    if (err) {
      return res.send(util.sendError(400, err));
    }
    let pathFile = '';
    pathFile = await req.file.path.split('\\').join('/');
    try {
      let user = await userService.updateAvatar(userId, pathFile);
      if (!user) {
        return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
      }
      return res.send(util.sendSuccess({ avatar: user.linkAvatar }));
    } catch (error) {
      return res
        .status(500)
        .send(util.error(util.INTERNAL_SERVER_ERROR, error));
    }
  });
}

async function uploadCmnd(req, res) {
  mulUploadCmnd(req, res, async (err) => {
    if (err) {
      return res.send(util.sendError(400, err));
    }
    const { path } = req.file;
    try {
      return res.send(util.sendSuccess({ link: path }));
    } catch (error) {
      return res
        .status(500)
        .send(util.error(util.INTERNAL_SERVER_ERROR, error));
    }
  });
}

async function getDetailUser(req, res) {
  try {
    const userId = req.params.id;
    let user = await userService.getDetailUser(userId);
    if (!user) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
    }
    return res.send(util.sendSuccess({ user }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getUserAssign(req, res) {
  // lấy danh sách các user để assign
  try {
    const { roleId, userId } = req;
    const role = await userService.getRoleUser(roleId);
    if (role.name === ROLE_LEADER) {
      // let userLeader = await userService.getUserById(userId);
      let data = await userService.getUserAssign();
      return res.send(util.sendSuccess({ user: data }));
    }
    let data = await userService.directorUserAssign(userId);
    return res.send(util.sendSuccess({ user: data }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getAllUserAssign(req, res) {
  // lấy danh sách các user để assign
  try {
    // let userLeader = await userService.getUserById(userId);
    let data = await userService.getAllUser();
    return res.send(util.sendSuccess({ user: data }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function getListUserRecruiter(req, res) {
  try {
    const { pageSize, pageNumber } = req.query;
    const roleRecruiter = await userService.getRoleRecruiter();
    const users = await userService.getListUserByRoleId(
      roleRecruiter.id,
      pageSize,
      pageNumber,
    );
    return res.send(util.sendSuccess({ total: users.total, list: users.list }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function registerRecruiter(req, res) {
  try {
    const rowsEmail = await userService.checkEmail(req.body.email.trim());
    if (rowsEmail !== 0) {
      return res
        .status(409)
        .send(util.sendError(409, 'Email already exitsts!'));
    }
    const { email, name, password } = req.body;
    let role = await userService.getRoleRecruiter();
    const userPassword = await hash(password.toString().trim());
    const data = {
      email: email.trim(),
      password: userPassword,
      roleId: role.id,
      name: name.trim(),
    };
    const user = await userService.insertRecruiter(data);
    // const token = jwt.sign(
    //   {
    //     userId: user.id,
    //     roleId: user.roleId,
    //     email: user.email,
    //   },
    //   config.app.secretKey,
    // );
    // const emailService = new EmailService();
    // let dataSendEmail = {
    //   email,
    //   token,
    // };
    // await emailService.verifyEmailRegisterRecruiter(dataSendEmail);
    return res.send(util.sendSuccess({ userId: user.id, roleId: user.roleId, email: user.email }));
  } catch (e) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function verifyRecruiterByEmail(req, res) {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, config.app.secretKey);
    if (!decoded) {
      return res.send(util.sendError(404, 'Token not availble !'));
    }
    const idUser = decoded.userId;

    const user = await userService.getUserById(idUser);
    if (!user) {
      return res.send(util.sendError(400, 'User not found !'));
    }
    if (user.isVerify) {
      return res.send(util.sendError(401, 'token is expired'));
    }
    let data = {
      isVerify: true,
      isDelete: false,
    };
    await userService.updateAllDataUser(idUser, data);
    return res.status(200).send(util.sendSuccess('Email Verified!'));
  } catch (e) {
    return res
      .status(500)
      .send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function calcBonusOfRecruiter(req, res) {
  try {
    let { userId } = req;
    if (req.query.recruiterId) {
      userId = req.query.recruiterId;
    }
    const syncBonus = await syncCandidateBonusOfRecruiter(userId);
    return res.send(util.sendSuccess({ syncBonus }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}
// eslint-disable-next-line consistent-return
async function generateKeyVerifyEmail(req, res) {
  try {
    const { email } = req.params;
    const user = await userService.findEmail(email);

    if (!user) {
      return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user && user.isVerify) {
      return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    const random6Character = randomstring.generate({
      length: 6,
      charset: 'numeric',
    });

    await userService.updateAllDataUser(user.id, {
      codeVerify: random6Character,
    });

    const emailService = new EmailService();

    const dataSendEmail = {
      email: user.email,
      codeVerify: random6Character,
    };

    await emailService.verifyEmailRegisterRecruiter(dataSendEmail);

    return res.send(util.sendSuccess({ user }));
  } catch (err) {
    console.log(err);
  }
}

async function handleVerifyEmail(req, res) {
  try {
    const { email, codeVerify } = req.params;
    const user = await userService.findEmail(email);
    if (!user) {
      return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }

    if (user && user.isVerify) {
      return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user.codeVerify !== codeVerify) {
      return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }

    await userService.updateAllDataUser(user.id, {
      isVerify: true,
      isDelete: false,
    });

    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        email: user.email,
      },
      config.app.secretKey,
    );

    let timestamp = moment(new Date()).format('x');

    // token nay dung de check login
    const tokenTimeStamp = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        timestamp,
      },
      config.app.secretKeyRefresh,
    );
    userService.updateLastLoginUser(user.id, token, tokenTimeStamp);
    let role = await userService.getUserCheck(user.id);

    return res.send(
      util.sendSuccess({
        userId: user.id,
        roleId: user.roleId,
        role: role.Role.name,
        email: user.email,
        token,
        tokenTimeStamp,
      }),
    );
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function siginRecruiter(req, res) {
  const { email, password, isRemember } = req.body;
  let expiresIn = '';
  try {
    const user = await userService.findEmail(email);
    if (!user) {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user.Role.name !== 'Recruiter') {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    const hashPassword = user.password;
    const variable = await compare(password, hashPassword);
    if (!variable) {
      return res.status(400).send(util.sendError(400, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user.isDelete && user.isVerify) {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (!user.isVerify) {
      return res.status(500).send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }

    if (isRemember) {
      expiresIn = '5d';
    } else {
      expiresIn = '1d';
    }
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        email: user.email,
      },
      config.app.secretKey, {
        expiresIn,
      },
    );

    let timestamp = moment(new Date()).format('x');
    // token nay dung de check login
    const tokenTimeStamp = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        timestamp,
      },
      config.app.secretKeyRefresh,
    );
    userService.updateLastLoginUser(user.id, token, tokenTimeStamp);
    let role = await userService.getUserCheck(user.id);

    return res.send(
      util.sendSuccess({
        userId: user.id,
        roleId: user.roleId,
        role: role.Role.name,
        email: user.email,
        token,
        tokenTimeStamp,
      }),
    );
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function siginSales(req, res) {
  const { email, password, isRemember } = req.body;
  let expiresIn = '';
  try {
    const user = await userService.findEmail(email);
    if (!user) {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user.Role.name !== 'Sales') {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    const hashPassword = user.password;
    const variable = await compare(password, hashPassword);
    if (!variable) {
      return res.status(400).send(util.sendError(400, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (isRemember) {
      expiresIn = '5d';
    } else {
      expiresIn = '1d';
    }
    const token = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        email: user.email,
      },
      config.app.secretKey, {
        expiresIn,
      },
    );

    let timestamp = moment(new Date()).format('x');
    // token nay dung de check login
    const tokenTimeStamp = jwt.sign(
      {
        userId: user.id,
        roleId: user.roleId,
        timestamp,
      },
      config.app.secretKeyRefresh,
    );
    userService.updateLastLoginUser(user.id, token, tokenTimeStamp);
    let role = await userService.getUserCheck(user.id);

    return res.send(
      util.sendSuccess({
        userId: user.id,
        roleId: user.roleId,
        role: role.Role.name,
        email: user.email,
        token,
        tokenTimeStamp,
      }),
    );
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const mailService = new EmailService();
    const user = await userService.findEmail(email);
    if (!user) {
      return res.send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user) {
      const userId = user.id;
      const token = jwt.sign({
        userId,
      }, config.app.secretKey);
      const dataSendEmail = {
        email,
        token,
      };
      mailService.sendEmailForgotPassword(dataSendEmail);
    }
    return res.send(util.sendSuccess());
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function changePasswordByToken(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const verifyToken = jwt.verify(token,
      config.app.secretKey,
      {
        expiresIn: '10m',
      });
    const { userId } = verifyToken;

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    if (user) {
      const userPassword = await hash(password.toString().trim());
      await userService.updateAllDataUser(user.id, {
        password: userPassword,
      });
    }

    return res.send(util.sendSuccess());
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function changePassword(req, res) {
  try {
    const { password, oldPassword } = req.body;
    const { userId } = req;

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).send(util.sendError(404, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    const userPassword = await hash(password.toString().trim());
    const variable = await compare(oldPassword, user.password);
    if (!variable) {
      return res.status(500).send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
    }
    await userService.updateAllDataUser(user.id, {
      password: userPassword,
    });

    return res.send(util.sendSuccess());
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

async function loginSocials(req, res) {
  try {
    const response = req.body;
    // check user exist
    let recruiter = await userService.getUserBySocial(response.id, response.social);
    if (!recruiter) {
      let role = await userService.getRoleRecruiter();
      // create new user
      const dataCreateUserSocial = {
        socialId: response.id,
        social: response.social,
        name: response.name,
        roleId: role.id,
        email: response.email ? response.email : '',
        isVerify: true,
        isDelete: false,
      };
      recruiter = await userService.createAllUser(dataCreateUserSocial);
    }

    const token = jwt.sign(
      {
        userId: recruiter.id,
        roleId: recruiter.roleId,
        email: recruiter.email,
      },
      config.app.secretKey, {
        expiresIn: '10d',
      },
    );

    let timestamp = moment(new Date()).format('x');
    // token nay dung de check login
    const tokenTimeStamp = jwt.sign(
      {
        userId: recruiter.id,
        roleId: recruiter.roleId,
        timestamp,
      },
      config.app.secretKeyRefresh,
    );
    userService.updateLastLoginUser(recruiter.id, token, tokenTimeStamp);
    let role = await userService.getUserCheck(recruiter.id);

    return res.send(
      util.sendSuccess({
        userId: recruiter.id,
        roleId: recruiter.roleId,
        role: role.Role.name,
        email: recruiter.email,
        token,
        tokenTimeStamp,
      }),
    );
  } catch (err) {
    console.log(err);
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

module.exports = {
  sigin,
  register,
  authenticateRole,
  getListUser,
  updateUser,
  deleteUser,
  getAllUser,
  getUser,
  getLastLogin,
  getUserTrello,
  checkBrowser,
  getUserTask,
  getProfile,
  uploadAvatar,
  getDetailUser,
  getUserAssign,
  getListUserRecruiter,
  updateAllDataUser,
  registerRecruiter,
  verifyRecruiterByEmail,
  calcBonusOfRecruiter,
  uploadCmnd,
  generateKeyVerifyEmail,
  handleVerifyEmail,
  siginRecruiter,
  forgotPassword,
  changePasswordByToken,
  siginSales,
  changePassword,
  loginSocials,
  getAllUserAssign,
};
