const { Role } = require('../../models');

const getAllRole = async () => {
  let roles = await Role.findAll({
    attributes: ['id', 'name'],
  });
  return roles;
};

const getRoleMember = async (nameRole) => {
  let role = await Role.findAll({
    where: {
      name: nameRole,
    },
    attributes: ['id', 'name'],
  });
  return role;
};

module.exports = {
  getAllRole,
  getRoleMember,
};
