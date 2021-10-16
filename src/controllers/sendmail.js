const nodemailer = require('nodemailer'); // send email
const appRoot = require('app-root-path'); // lay root link project
const hbs = require('nodemailer-express-handlebars'); // send email with html
const util = require('../common/util');

const mailFrom = 'sales@fetch.tech';
const mailTo = 'sales@fetch.tech';

// Send email =============
const option = {
  service: 'gmail',
  auth: {
    user: mailFrom, // email hoặc username, user luu trong BD ???
    pass: 'Letmein99', // password
  },
};
const transporter = nodemailer.createTransport(option);
transporter.use(
  'compile',
  hbs({
    // template folder
    viewEngine: {
      extname: '.hbs',
      partialsDir: `${appRoot.path}/src/templates/`,
      layoutsDir: './src/templates/',
      defaultLayout: false,
    },
    viewPath: './src/templates/',
  }),
);

// eslint-disable-next-line consistent-return
const sendMailBuildTeam = async (req, res) => {
  try {
    let data = req.body;
    // let eng = data.engineerings;
    // let engineerings = '';
    // if (eng.testers) {
    //   engineerings += ', Testers';
    // }
    // if (eng.designers) {
    //   engineerings += ', Designers';
    // }
    // if (eng.devOps) {
    //   engineerings += ', DevOps';
    // }
    // if (eng.developers) {
    //   engineerings += ', Developers';
    // }
    // if (eng.projectManagers) {
    //   engineerings += ', Project Managers';
    // }
    // engineerings = engineerings.substr(1);
    // let tech = '';
    // data.techStack.forEach((skill) => {
    //   tech = `${tech}, ${skill.text}`;
    // });
    // tech = tech.substr(1);
    console.log(req.body);
    let context = {
      // tech,
      name: data.name,
      phone: data.phone,
      email: data.email,
      company: data.company,
      // year: data.yearsOfExp,
      // budget: data.budget,
      // eng: engineerings,
    };
    const subject = '[FETCH TECHNOLOGY - BUILD A TEAM]';
    let mail = {
      from: mailFrom, // Địa chỉ email của người gửi
      to: mailTo, // Địa chỉ email của ung vien
      subject, // Tiêu đề mail
      template: 'buildteam',
      context,
    };
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.log(error, 'send mail err');
        return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
      }
      console.log(info.response);
      return res.status(200).send(util.sendSuccess({ message: 'send mail success !' }));
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
};

// eslint-disable-next-line consistent-return
const sendMailHouseTeam = async (req, res) => {
  try {
    let data = req.body;
    console.log(req.body);
    let context = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      location: data.location,
    };
    const subject = '[FETCH TECHNOLOGY-MANAGED-SERVICE]';
    let mail = {
      from: mailFrom, // Địa chỉ email của người gửi
      to: mailTo, // Địa chỉ email của ung vien
      subject, // Tiêu đề mail
      template: 'houseteam',
      context,
    };
    transporter.sendMail(mail, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
      }
      console.log(info.response);
      return res.status(200).send(util.sendSuccess({ message: 'Send mail success !' }));
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR));
  }
};

module.exports = {
  sendMailBuildTeam,
  sendMailHouseTeam,
};
