module.exports = (sequelize, DataTypes) => {
  const CandidateJobBonus = sequelize.define('CandidateJobBonus', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    candidateJobId: {
      type: DataTypes.UUID,
      references: {
        model: "CandidateJob",
        key: "id"
      },
    },
    level: {
      type: DataTypes.INTEGER
    },
    bonus: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
  });
  CandidateJobBonus.associate = function (models) {
    CandidateJobBonus.belongsTo(models.CandidateJob)
  };
  return CandidateJobBonus;
};
