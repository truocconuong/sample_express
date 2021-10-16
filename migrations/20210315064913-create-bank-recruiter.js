module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('BankRecruiter', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      bankNumber: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      bankName: {
        type: Sequelize.STRING,
      },
      recruiterId: {
        type: Sequelize.UUID,
        references: {
          model: 'User',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      urlFrontImageIdCard: {
        type: Sequelize.TEXT,
      },
      urlBehindImageIdCard: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('BankRecruiter');
  }
};