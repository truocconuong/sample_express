const parseIt = require('./utils/parseIt');
let logger = require('tracer').colorConsole();

module.exports.parseResumeFile = function (inputFile) {
  return new Promise((resolve, reject) => {
    parseIt.parseResumeFile(inputFile, (file, error) => {
      if (error) {
        return reject(error);
      }
      return resolve(file);
    });
  });
};

module.exports.parseResumeUrl = function (url) {
  return new Promise((resolve, reject) => {
    parseIt.parseResumeUrl(url, (file, error) => {
      if (error) {
        return reject(error);
      }
      return resolve(file);
    });
  });
};
