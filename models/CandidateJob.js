'use strict';
module.exports = (sequelize, DataTypes) => {
  const CandidateJob = sequelize.define('CandidateJob', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    candidateId: {
      type: DataTypes.UUID,
      references: {
        model: "Candidate",
        key: "id"
      },
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: "Job",
        key: "id"
      },
    },
    laneId: {
      type: DataTypes.UUID,
      references: {
        model: "Lane",
        key: "id"
      },
    },
    userCreate: {
      type: DataTypes.STRING,
    },
    approachDate: {
      type: DataTypes.DATE,
    },
    cv: {
      type: DataTypes.STRING,
    },
    source: {
      type: DataTypes.STRING,
    },
    parserPdf: {
      type: DataTypes.TEXT
    },
    dataParserPdf: {
      type: DataTypes.JSON
    },
    noteApproach: {
      type: DataTypes.TEXT("long"),
    },
    position: {
      type: DataTypes.STRING,
    },
    isAddCard: {
      type: DataTypes.BOOLEAN,
    },
    isRefinePdf: {
      type: DataTypes.BOOLEAN
    },
    storage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    linkPortfolio: {
      type: DataTypes.TEXT,
    },
    noteRecruiter: {
      type: DataTypes.TEXT('long'),
    },
    referalId: {
      type: DataTypes.UUID,
      references: {
        model: "User",
        key: "id"
      },
    },
    // timeAddCard: {
    //   type: DataTypes.DATE,
    // },
    expectedDate : {
      type: DataTypes.DATE,
    },
    dueDate : {
      type: DataTypes.DATE,
    },
    refineCv : {
      type:DataTypes.TEXT
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  CandidateJob.associate = function (models) {
    CandidateJob.belongsTo(models.Job, {
      foreignKey: 'jobId'
    });
    CandidateJob.belongsTo(models.Candidate, {
      foreignKey: 'candidateId'
    });
    CandidateJob.belongsTo(models.Lane, {
      foreignKey: 'laneId'
    });
    CandidateJob.hasMany(models.CardUser, {
      foreignKey: 'cardId'
    })
    CandidateJob.belongsToMany(models.User, {
      through: "CardUser",
      foreignKey: "cardId"
    });
    CandidateJob.hasOne(models.Interview, {
      foreignKey: 'cardId'
    })
    CandidateJob.belongsTo(models.User, {
      foreignKey: 'userCreate'
    })
    CandidateJob.hasMany(models.History, {
      foreignKey: 'idCard',
    });
    CandidateJob.hasMany(models.Label, {
      foreignKey: 'candidateJobId'
    })
    CandidateJob.hasMany(models.CandidateJobBonus, {
      foreignKey: 'candidateJobId',
    });
  };
  return CandidateJob;
};