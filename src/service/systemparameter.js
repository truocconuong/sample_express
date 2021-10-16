const { SystemParameter } = require('../../models');

const getSystems = async () => {
  let systems = await SystemParameter.findAll();
  return systems;
};

const updateSystem = async (key, value) => {
  const system = await SystemParameter.findOne({
    where: {
      key,
    },
  });
  if (system) {
    await system.update({ value });
  }
  return system;
};

module.exports = {
  getSystems,
  updateSystem,
};
