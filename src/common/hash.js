const bcrypt = require('bcryptjs');

const saltRound = 10;

const hash = (plainText) => bcrypt.hash(plainText || '', saltRound);
const compare = (plainText, hashText) => bcrypt.compare(plainText || '', hashText || '');

module.exports = {
  hash,
  compare,
};
