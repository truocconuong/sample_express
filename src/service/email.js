const { Email } = require('../../models');

const createEmail = (data) => Email.create({
  createdBy: data.createdBy,
  emailTo: data.emailTo,
  inCC: data.inCC || '',
  body: data.body,
  emailType: data.emailType,
  statusEmail: 'Pending',
  createdTime: new Date(),
});

const updateStatusEmail = async (id) => {
  let email = await Email.findByPk(id);
  await email.update({
    statusEmail: 'Success',
    sentTime: new Date(),
  });
};

const getAllEmailPending = () => Email.findAll({
  where: {
    statusEmail: 'Pending',
  },
});

module.exports = {
  createEmail,
  updateStatusEmail,
  getAllEmailPending,
};
