'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ExtractPdf', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.TEXT
      },
      candidateJobId: {
        type: Sequelize.STRING
      },
      isRefine: {
        type: Sequelize.BOOLEAN
      },
      nameFile : {
        type:Sequelize.TEXT
      },
      folderId : {
        type:Sequelize.TEXT
      },
      message : {
        type:Sequelize.JSON
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
    await queryInterface.dropTable('ExtractPdf');
  }
};