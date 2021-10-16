module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Lane', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      nameColumn: {
        type: Sequelize.STRING,
      },
      background : {
        type:Sequelize.TEXT
      },
      disabled : {
        type: DataTypes.BOOLEAN
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
    await queryInterface.dropTable('Lane');
  },
};
