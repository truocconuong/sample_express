module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('JobSkill', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      skillId: {
        type: Sequelize.UUID,
        references: {
          model: 'Skill',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      isRequired: {
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
    await queryInterface.dropTable('JobSkill');
  },
};
