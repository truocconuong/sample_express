let _ = require('underscore');
let ParseBoy = require('./ParseBoy');
let processing = require('./libs/processing');
let logger = require('tracer').colorConsole();

let parser = {
  parseResumeFile(file, cbAfterParse) {
    let objParseBoy = new ParseBoy();
    let savedFiles = 0;
    let onFileReady = function (preppedFile, error) {
      if (error) {
        return cbAfterParse(null, error);
      }
      objParseBoy.parseFile(preppedFile, (Resume) => {
        cbAfterParse(Resume.parts);

        // objParseBoy.storeResume(preppedFile, Resume, savePath, function(err) {
        //   if (err) {
        //     logger.error('Resume ' + preppedFile.name + ' errored', err);
        //     return cbAfterParse(
        //       null,
        //       'Resume ' + preppedFile.name + ' errored'
        //     );
        //   }
        //   logger.trace('Resume ' + preppedFile.name + ' saved');
        //   return cbAfterParse(preppedFile.name);
        // });
      });
    };
    processing.runFile(file, onFileReady);
  },
  parseResumeUrl(url, cbAfterParse) {
    let objParseBoy = new ParseBoy();

    let onUrlReady = function (preppedData, error) {
      if (error) {
        return cbAfterParse(null, error);
      }

      objParseBoy.parseUrl(preppedData, (Resume) => {
        logger.trace(`I got Resume for ${url}, now sending...`);
        return cbAfterParse(Resume.parts);
      });
    };

    processing.runUrl(url, onUrlReady);
  },
};
module.exports = parser;
