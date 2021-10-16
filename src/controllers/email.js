const nodemailer = require('nodemailer'); // send email
const emailService = require('../service/email');
const util = require('../common/util');

const option = {
  service: 'gmail',
  auth: {
    user: 'onlyusesendemail@gmail.com', // email người gửi
    pass: 'khongcomatkhau', // password
  },
};
const transporter = nodemailer.createTransport(option);

async function addEmail(req, res) {
  try {
    let data = req.body;
    let result = await emailService.createEmail(data);
    return res.send(util.sendSuccess({ result }));
  } catch (err) {
    return res.send(util.sendError(500, util.errorCodes.INTERNAL_SERVER_ERROR));
  }
}

// eslint-disable-next-line consistent-return
const sendMail = async (data) => {
  try {
    const subject = '[FETCH TECHNOLOGY]';
    let mail = {
      from: 'onlyusesendemail@gmail.com',
      to: data.emailTo || 'onlyusesendemail@gmail.com',
      text: data.body,
      subject,
    };
    if (data.inCC) {
      mail = {
        from: 'onlyusesendemail@gmail.com',
        to: data.emailTo || 'onlyusesendemail@gmail.com',
        cc: data.inCC,
        text: data.body,
        subject,
      };
    }
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.log(error);
        return false;
      }
      console.log(info);
      emailService.updateStatusEmail(data.id);
      return true;
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};

module.exports = {
  addEmail,
  sendMail,
};
