// const testController = require('./test');
const authController = require('./auth');
const locationController = require('./location');
const clientController = require('./client');
const jobController = require('./job');
const candidateController = require('./candidate');
const laneController = require('./lane');
const cardController = require('./card');
const teamController = require('./team');
const roleController = require('./role');
const skillController = require('./skill');
const taskController = require('./task');
const interviewController = require('./interview');
const notificationController = require('./notification');
const systemparameterController = require('./systemparameter');
const sendmailController = require('./sendmail'); // được sử dùng để gửi mail ở trang fetch.tech
const cronjobController = require('./cronjob');
const emailController = require('./email');
const historyController = require('./history');
const blogController = require('./blog');
const caculatorController = require('./caculator');
const socialController = require('./social');
const bankrecruiterController = require('./bankrecruiter');
const recruiterController = require('./recruiter');
// const chatbotController = require('./chatbot');
const versionTwo = require('./v2');
const listtaskController = require('./listTask');

module.exports = {
  // Test: testController,
  Auth: authController,
  Location: locationController,
  Client: clientController,
  Job: jobController,
  Candidate: candidateController,
  Lane: laneController,
  Card: cardController,
  Team: teamController,
  Role: roleController,
  Skill: skillController,
  Task: taskController,
  Interview: interviewController,
  Notification: notificationController,
  SystemParameter: systemparameterController,
  SendMail: sendmailController,
  CronJob: cronjobController,
  Email: emailController,
  History: historyController,
  Blog: blogController,
  Caculator: caculatorController,
  Social: socialController,
  BankRecruiter: bankrecruiterController,
  Recruiter: recruiterController,
  // ChatBot: chatbotController,
  V2: versionTwo,
  ListTask: listtaskController,
};
