module.exports = (sequelize, DataTypes) => {
  const UserJob = sequelize.define('UserJob', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
      onUpdate: 'cascade',
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: 'Job',
        key: 'id',
      },
      onUpdate: 'cascade',
    },
    idUrlShort: {
      type: DataTypes.STRING,
    },
    urlShort: {
      type: DataTypes.STRING,
    },
    numberCandidate: {
      type: DataTypes.INTEGER,
    },
    codeBitly: {
      type: DataTypes.STRING,
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
    },
    isFirst: {
      type: DataTypes.BOOLEAN,
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
  UserJob.associate = function (models) {
    UserJob.belongsTo(models.User, {
			foreignKey: 'userId'
		});
		UserJob.belongsTo(models.Job, {
			foreignKey: 'jobId'
		});
  };
  return UserJob;
};
