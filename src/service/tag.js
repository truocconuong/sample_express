const { Tag } = require('../../models');

const getAllTag = () => Tag.findAll();

module.exports = {
  getAllTag,
};
