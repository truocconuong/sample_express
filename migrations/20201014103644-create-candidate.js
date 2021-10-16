module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Candidate', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      skill: {
        type: Sequelize.TEXT('long'),
      },
      message: {
        type: Sequelize.TEXT('long'),
      },
      location: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      approachDate: {
        type: Sequelize.STRING,
      },
      fromWhom: {
        type: Sequelize.STRING,
      },
      nameJob: {
        type: Sequelize.STRING,
      },
      idList: {
        type: Sequelize.STRING,
      },
      recordYear: {
        type: Sequelize.STRING,
      },
      source: {
        type: Sequelize.STRING,
      },
      facebook: {
        type: Sequelize.TEXT,
      },
      linkedin: {
        type: Sequelize.TEXT,
      },
      skype: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Candidate');
  },
};
