module.exports = (sequelize, DataTypes) => {
  const JobTag = sequelize.define('JobTag', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: "Job",
        key: "id"
      },
    },
    tagId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Tag",
        key: "id"
      },
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
  JobTag.associate = function (models) {
   
  };
  return JobTag;
};
