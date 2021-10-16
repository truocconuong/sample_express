module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaskUser', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      taskId: {
        type: Sequelize.UUID,
        references: {
          model: 'ListTask',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
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
    await queryInterface.dropTable('TaskUser');
  }
};