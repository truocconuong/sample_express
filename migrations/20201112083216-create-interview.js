'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Interview', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      cardId: {
        type: Sequelize.UUID,
        references: {
          model: 'CandidateJob',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.STRING,
      },
      timeInterview: {
        type: Sequelize.DATE
      },
      timeInterviewEnd : {
        type:Sequelize.DATE
      },
      linkZoom: {
        type: Sequelize.STRING
      },
      viewer : {
        type:Sequelize.STRING
      },
      review : {
        type:DataTypes.JSON
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
    await queryInterface.dropTable('Interview');
  }
};