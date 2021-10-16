const schedule = require('node-schedule');
const moment = require('moment');
const { forEach } = require('async-foreach');
const _ = require('lodash');
const util = require('../common/util');
const jobService = require('../service/job');
const userService = require('../service/user');
const notificationService = require('../service/notification');
const emailService = require('../service/email');
const emailController = require('./email');
const { configGoogleDrive } = require('../../config/global');
const extractPdfService = require('../service/extractPdf');
const candidateService = require('../service/candidate');
const { handleExtractPdf } = require('../service/resume-pdf/extract');
const { EmailService } = require('../service/email/EmailService');

async function activeJobNotification(req, res) {
  // eslint-disable-next-line consistent-return
  schedule.scheduleJob('0 1 * * *', async () => {
    try {
      let dataPromise = jobService.notificationJob();
      let directorPromise = userService.getUserDirector();
      let data = await dataPromise;
      let director = await directorPromise;
      let time = moment(new Date(), 'DD-MM-YYYY');
      forEach(data, async (job) => {
        let timeEnd = job.time.split('-')[1].trim();
        timeEnd = moment(timeEnd, 'DD-MM-YYYY');
        let arrayUser = []; // mang cac director sẽ bắn thông báo về.
        forEach(director, (user) => {
          arrayUser.push(user.id);
        });
        if (job.UserJobs && Object.keys(job.UserJobs).length > 0) {
          arrayUser.push(job.UserJobs[0].userId); // thêm thông báo về người tạo nữa!
        }
        if (time > timeEnd) {
          forEach(arrayUser, (userId) => {
            let dataNotification = {
              userId,
              content: {
                id: job.id,
                title: job.title,
                message: 'The system notifies you that a job has expired',
              },
              type: 'jobOverTime',
              status: false,
            };
            notificationService.createNotification(dataNotification);
          });
        }
      });
    } catch (err) {
      return res.status(500).send(util.error(util.INTERNAL_SERVER_ERROR, err));
    }
  });
}

async function serviceEmail() {
  schedule.scheduleJob('*/1 * * * *', async () => {
    try {
      let data = await emailService.getAllEmailPending();
      if (data) {
        forEach(data, (email) => {
          emailController.sendMail(email);
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
}

async function serviceRefinePdf() {
  schedule.scheduleJob('*/1 * * * *', async () => {
    try {
      const config = await configGoogleDrive();
      const listExtracts = await extractPdfService.getAllExtractNoProcess();
      _.map(listExtracts, async (extract) => {
        try {
          const dataAfterHandle = await handleExtractPdf(extract, config);
          const dataUpdateCandidateJob = {
            isRefinePdf: true,
            ...dataAfterHandle,
          };
          await candidateService.updateCandidateJob(extract.candidateJobId, dataUpdateCandidateJob);
          const dataUpdateExtractPdf = {
            isRefine: true,
          };
          await extractPdfService.updateExtractPdf(extract.id, dataUpdateExtractPdf);
          return extract;
        } catch (error) {
          const dataError = {
            message: error.toString(),
            isRefine: true,
          };
          await extractPdfService.updateExtractPdf(extract.id, dataError);
        }
        return extract;
      });
    } catch (error) {
      console.log(error);
    }
  });
}

async function sendEmailListJobRecruiter() {
  schedule.scheduleJob('0 0 2 * *', async () => {
    const serEmail = new EmailService();
    try {
      serEmail.sendEmailAllowJobRecruiter();
    } catch (error) {
      console.log(error);
    }
  });
}

async function sendEmailListCandidateRecruiter() {
  const serEmail = new EmailService();
  try {
    schedule.scheduleJob('0 0 2 * *', async () => {
      serEmail.emailListCandidateRecruiter();
    });
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  activeJobNotification,
  serviceEmail,
  serviceRefinePdf,
  sendEmailListJobRecruiter,
  sendEmailListCandidateRecruiter,
};
