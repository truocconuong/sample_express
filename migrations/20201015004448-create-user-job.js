module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserJob', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'User',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      jobId: {
        type: Sequelize.UUID,
        references: {
          model: 'Job',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      idUrlShort: {
        type: Sequelize.STRING,
      },
      urlShort: {
        type: Sequelize.STRING,
      },
      numberCandidate: {
        type: Sequelize.INTEGER,
      },
      codeBitly: {
        type: Sequelize.STRING,
      },
      isFirst: {
        type: Sequelize.BOOLEAN,
      },
      isDelete: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('UserJob');
  },
};
