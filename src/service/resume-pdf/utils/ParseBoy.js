const _ = require('underscore');
const processing = require('./libs/processing');
const parser = require('./libs/parser');
const logger = require('tracer').colorConsole();

/**
 *
 * @constructor
 */
function ParseBoy() {}

/**
 *
 * @param PreparedFile
 * @param cbGetResume
 */
ParseBoy.prototype.parseFile = function (PreparedFile, cbGetResume) {
  parser.parse(PreparedFile, cbGetResume);
};

ParseBoy.prototype.parseUrl = function (PreparedData, cbGetResume) {
  parser.parse(
    {
      raw: PreparedData,
    },
    cbGetResume,
  );
};

/**
 *
 * @param PreparedFile
 * @param Resume
 * @param path
 * @param cbOnSaved
 */
// ParseBoy.prototype.storeResume = function(
//   PreparedFile,
//   Resume,
//   path,
//   cbOnSaved
// ) {

//   PreparedFile.addResume(Resume);

//   if (!_.isFunction(cbOnSaved)) {
//     return logger.error('cbOnSaved should be a function');
//   }
//   PreparedFile.saveResume(path, cbOnSaved);
// };

/**
 *
 * @type {ParseBoy}
 */
module.exports = ParseBoy;
