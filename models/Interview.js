module.exports = (sequelize, DataTypes) => {
  const Interview = sequelize.define('Interview', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    cardId: {
      type: DataTypes.UUID,
      references: {
        model: 'CandidateJob',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.STRING,
    },
    timeInterview: {
      type: DataTypes.DATE
    },
    timeInterviewEnd : {
      type: DataTypes.DATE
    },
    linkZoom: {
      type: DataTypes.STRING
    },
    viewer : {
      type:DataTypes.STRING
    },
    review : {
      type:DataTypes.JSON
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
  Interview.associate = function (models) {
   Interview.belongsTo(models.User, {
     foreignKey : 'userId'
   }),
   Interview.belongsTo(models.CandidateJob, {
    foreignKey : 'cardId'
  })
  };
  return Interview;
};
