module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Location', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    name: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    office: {
      type: Sequelize.STRING,
    },
    descLocation: {
      type: Sequelize.TEXT('long'),
    },
    linkMap: {
      type: Sequelize.TEXT('long'),
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Location'),
};
