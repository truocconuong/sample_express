'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Email', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      createdBy: {
        type: Sequelize.STRING
      },
      createdTime: {
        type: Sequelize.DATE,
      },
      emailTo: {
        type: Sequelize.STRING,
      },
      inCC: {
        type: Sequelize.STRING,
      },
      body: {
        type: Sequelize.TEXT('long'),
      },
      emailType: {
        type: Sequelize.STRING,
      },
      statusEmail: {
        type: Sequelize.STRING,
      },
      sentTime: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Email');
  }
};