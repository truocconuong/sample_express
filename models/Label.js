module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define('Label', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.TEXT
    },
    background: {
      type: DataTypes.TEXT
    },
    candidateJobId: {
      type: DataTypes.UUID,
      references: {
        model: "CandidateJob",
        key: "id"
      },
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {});
  Label.associate = function (models) {
    Label.belongsTo(models.CandidateJob)
  };
  return Label;
};
