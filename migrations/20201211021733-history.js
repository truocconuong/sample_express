'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('History', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT("long"),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      idCard: {
        type: Sequelize.UUID,
      },
      idJob: {
        type: Sequelize.UUID,
      },
      idUser: {
        type: Sequelize.UUID,
      },
      before:{
        type: Sequelize.JSON,
      },
      after:{
        type: Sequelize.JSON,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      type:{
        type: Sequelize.STRING,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('History');
  }
};