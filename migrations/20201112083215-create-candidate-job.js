'use strict';

const { DataTypes } = require("sequelize/types");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CandidateJob', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      candidateId: {
        type: Sequelize.UUID,
        references: {
          model: "Candidate",
          key: "id"
        },
      },
      jobId: {
        type: Sequelize.UUID,
        references: {
          model: "Job",
          key: "id"
        },
      },
      laneId: {
        type: Sequelize.UUID,
        references: {
          model: "Lane",
          key: "id"
        },
      },
      userCreate: {
        type: Sequelize.STRING,
      },
      approachDate: {
        type: Sequelize.DATE,
      },
      cv: {
        type: Sequelize.STRING,
      },
      position: {
        type: Sequelize.STRING,
      },
      noteApproach: {
        type: Sequelize.TEXT("long"),
      },
      isAddCard: {
        type: Sequelize.BOOLEAN,
      },
      source: {
        type: Sequelize.STRING,
      },
      parserPdf: {
        type: Sequelize.TEXT
      },
      dataParserPdf: {
        type: Sequelize.JSON
      },
      isRefinePdf: {
        type: Sequelize.BOOLEAN
      },
      order: {
        type: Sequelize.INTEGER
      },
      storage: {
        type: Sequelize.BOOLEAN
      },
      linkPortfolio: {
        type: Sequelize.TEXT,
      },
      // timeAddCard: {
      //   type: Sequelize.TEXT
      // },
      referalId: {
        type: Sequelize.UUID,
        references: {
          model: "User",
          key: "id"
        },
      },
      expectedDate : {
        type: Sequelize.DATE,
      },
      dueDate : {
        type: Sequelize.DATE,
      },
      refineCv : {
        type:Sequelize.TEXT
      },
      noteRecruiter: {
        type: Sequelize.TEXT('long'),
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
    await queryInterface.dropTable('CandidateJob');
  }
};