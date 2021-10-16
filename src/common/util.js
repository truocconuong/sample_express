const fs = require('fs');
const _ = require('lodash');
const { google } = require('googleapis');
const moment = require('moment');
const getFBID = require('get-fbid');
const { configGoogleDrive } = require('../../config/global');
const extractPdfService = require('../service/extractPdf');
const candidateService = require('../service/candidate');

let drive = google.drive('v3');

const errorCodes = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
};

// use controller
const ROLE_DIRECTOR = 'Director';
const ROLE_LEADER = 'Leader';
const ROLE_MEMBER = 'Member';
const ROLE_ADMIN = 'Admin';

// use router
const Admin = 'Admin';
const Director = 'Director';
const Leader = 'Leader';
const Member = 'Member';
const Recruiter = 'Recruiter';
const Sales = 'Sales';

function sendError(code, errorStr, err) {
  return {
    code: code || 500,
    // eslint-disable-next-line no-use-before-define
    data: error(errorStr, err),
  };
}

function sendSuccess(response) {
  const responseData = { success: true, ...response };
  return {
    code: 200,
    data: responseData,
  };
}

function error(errorStr, err) {
  return {
    success: false,
    error: errorStr || errorCodes.INTERNAL_SERVER_ERROR,
    message: err ? err.toString() : undefined,
  };
}

function generatePathPdf(name, idJob) {
  const result = `${'resume-'}${name}-${idJob}.pdf`;
  return result;
}

function convertTextBeautiful(data) {
  let result = { ...data };

  Object.keys(data).forEach((key) => {
    let textString = '';
    const text = data[key];
    const keyNotTrans = ['name', 'email'];

    const noTransformer = _.includes(keyNotTrans, key);
    if (!noTransformer) {
      if (_.isString(text)) {
        const arrayText = text.split('\n');
        arrayText.map((textChil) => {
          if (textChil !== '') {
            const index = textChil.indexOf(':');
            let textAfterCustom;
            if (index !== -1) {
              textAfterCustom = `<p><strong>${textChil.slice(0, index + 1)}</strong>${textChil.slice(index + 1, textChil.length)}</p>`;
            } else {
              textAfterCustom = `<p>${textChil}</p>`;
            }
            textString += `${textAfterCustom}`;
          }
          return textChil;
        });
      }
    } else {
      textString = data[key];
    }
    result[key] = textString;
  });
  return result;
}

async function readDriveAndStorageCronJob(linkDrive, candidateJobId) {
  let nameFile = '';
  const getCandidateJob = await candidateService.getCandidatePopup(candidateJobId);
  const config = await configGoogleDrive();
  const fileId = linkDrive ? linkDrive.slice(linkDrive.lastIndexOf('/') + 1, linkDrive.length) : '';
  const jwtClient = new google.auth.JWT(
    config.driverAccount,
    null,
    config.driverToken,
    ['https://www.googleapis.com/auth/drive'],
    null,
  );

  if (getCandidateJob) {
    nameFile = `${generatePathPdf(getCandidateJob.Candidate.name, getCandidateJob.jobId)}`;
  }
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
        if (err) throw err;
        const writStream = fs.createWriteStream(`./uploads/${nameFile}`);
        dataDrive.data.on('data', (e) => {
          writStream.write(e);
        });
        dataDrive.data.on('end', async () => {
          const saveDataExtract = {
            url: `./uploads/${nameFile}`,
            candidateJobId,
            nameFile,
            folderId: getCandidateJob.Job.folderId,
          };
          await extractPdfService.insertExtractPdf(saveDataExtract);
          writStream.end();
        });
        return true;
      },
    );
  } catch (error1) {
    console.log(error1);
  }
}

function convertDateLocal(time) {
  return moment(time).subtract('7', 'hour');
}

async function detectFacebookId(link) {
  let id = link;
  const findIdFacebook = link.indexOf('=');
  if (findIdFacebook !== -1) {
    id = link.slice(findIdFacebook + 1, link.length);
  } else {
    const regexCutUserName = /\.com[/](.*)\/?/;
    const checkMatch = link.match(regexCutUserName);
    if (checkMatch) {
      let matched = checkMatch[1];
      id = matched.replace('/', '');
    }
    try {
      const idFacebook = await getFBID(id);
      if (idFacebook) {
        id = idFacebook;
      }
    } catch (err) {
      return id;
    }
  }
  return id;
}

function detectLinkedinId(link) {
  let id = link;
  const regexLinkedin = /\/in[/](.*)/;
  const convertLink = link.slice(link.length - 1) === '/' ? link.slice(0, link.length - 1) : link;
  const match = convertLink.match(regexLinkedin);
  if (match !== null) {
    const [, two] = match;
    if (match) {
      id = two;
    }
  }
  return id;
}

function detectSkypeId(link) {
  let id = link;
  const regexLinkedin = /live:(.*)/;
  let match = link.match(regexLinkedin);
  if (match) {
    const [, two] = match;
    id = two;
  }
  return id;
}

module.exports = {
  error,
  errorCodes,
  sendError,
  sendSuccess,
  ROLE_DIRECTOR,
  ROLE_LEADER,
  ROLE_MEMBER,
  ROLE_ADMIN,
  Admin,
  Director,
  Leader,
  Member,
  Recruiter,
  Sales,
  generatePathPdf,
  convertTextBeautiful,
  readDriveAndStorageCronJob,
  convertDateLocal,
  detectFacebookId,
  detectLinkedinId,
  detectSkypeId,
};
