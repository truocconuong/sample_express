const _ = require('lodash');
const { EmailMethod } = require('./EmailMethod');
const emailService = require('../email');
const candidateService = require('../candidate');
const userService = require('../user');
const jobService = require('../job');
const candidateJobService = require('../candidatejob');

const notificationRecruiterService = require('../notificationRecruiter');
const { templateJob } = require('../../common/template-email/notificationJob');

class EmailService {
  constructor() {
    this.transporter = new EmailMethod();
  }

  async triggerSendEmailClientReplyQuiz(dataSend) {
    const listEmail = await emailService.getAllEmail();
    const { email, contact, company } = dataSend;
    _.map(listEmail, async (emailSend) => {
      const dataSendEmail = {
        from: process.env.EMAIL_USER,
        to: emailSend.email,
        subject: 'SEND EMAIL',
        text: `${email} ${contact} ${company}`,
      };
      await this.transporter.sendMail(dataSendEmail);
    });
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  async triggerSendEmailRecruiterFollowCandidate(item) {
    const { referalId, candidateJobId } = item;
    const recruiter = await userService.getUserById(referalId);
    const candidateJob = await candidateService.getCandidateJobById(
      candidateJobId,
    );
    if (recruiter && candidateJob) {
      const nameColumn = candidateJob.Lane ? candidateJob.Lane.nameColumn : '';
      const dataSendDatabase = {
        recruiterId: referalId,
        candidateJobId,
        content: {
          subject: `[Fetch] Your candidates ${candidateJob.Candidate.name} moved to ${nameColumn === 'Interview F2F' ? 'Interview face to face' : nameColumn}`,
          message: `
          <p>Dear ${recruiter.name}
          <br>
          We’re happy to let you know that, ${candidateJob.Candidate.name} has moved to <strong>${nameColumn === 'Interview F2F' ? 'Interview face to face' : nameColumn}</strong>.
          <br>
          Your friends at Fetch
          `,
          email: recruiter.email,
        },
      };
      notificationRecruiterService.createNotiRecruiter(dataSendDatabase);
    }
  }

  async verifyEmailRegisterRecruiter(data) {
    const { email, codeVerify } = data;
    const dataSendEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Fetch Technology Verification Code',
      html: `
      <div style='font-size: 15px; margin-left: 15px';>
        <p style='line-height:1'>Hello,</p>
        <p style='line-height:1'>Please use the verification code below on the Fetch website: </p>
        <b style='line-height:1'>${codeVerify}</b>
        <p style='line-height:1.2'>If you didn't request this, you can ignore this email or let us know.
        Thanks!</p>
        <p style='line-height:1'>Fetch team</p>
      </div>
      `,
    };
    this.transporter.sendMail(dataSendEmail);
  }

  async sendEmailForgotPassword(data) {
    const { email, token } = data;
    const dataSendEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset password instructions',
      html: `
      <div>
      Hello !
    <br> Someone, hopefully you, has requested to reset the password for your Recruiter Fetchtech account on https://vn.fetch.tech.
    <br>If you did not perform this request, you can safely ignore this email.
    <br>Otherwise, click the link below to complete the process.
    <br><a href="${process.env.SITE_VN_FETCH_TECH}/users/password/edit?reset_password_token=${token}">Reset password</a>
    </div>
    `,
    };
    this.transporter.sendMail(dataSendEmail);
  }

  async sendEmailAllowJobRecruiter() {
    const allJobShare = await jobService.getAllJobShareRecruiter();
    const recruiters = await userService.getAllRecruiter();
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < recruiters.length; i++) {
      const recruiter = recruiters[i];
      setTimeout(() => {
        if (recruiter.email) {
          const contentSend = templateJob(recruiter.name, allJobShare);
          const dataSendEmail = {
            from: process.env.EMAIL_USER,
            to: recruiter.email,
            subject: 'Job Alert from Fetch Technology',
            html: contentSend,
          };
          this.transporter.sendMail(dataSendEmail);
        }
      }, i * 3000);
    }
  }

  async emailListCandidateRecruiter() {
    const notificationsRecruiter = await candidateJobService.getAllNotificationRecruiter();
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < notificationsRecruiter.length; index++) {
      setTimeout(() => {
        const { content } = notificationsRecruiter[index];
        const dataSendEmail = {
          from: process.env.EMAIL_USER,
          to: content.email,
          subject: content.subject,
          html: content.message,
        };
        this.transporter.sendMail(dataSendEmail);

        notificationsRecruiter[index].update({
          status: true,
        });
      }, index * 3000);
    }
  }
}

module.exports = { EmailService };
