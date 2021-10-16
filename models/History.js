module.exports = (sequelize, DataTypes) => {
  const History = sequelize.define('History', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    content: {
      allowNull: false,
      type: DataTypes.TEXT("long"),
      defaultValue : ''
    },
    idCard: {
      type: DataTypes.UUID,
      references: {
        model: 'CandidateJob',
        key: 'id',
      },
    },
    idJob: {
      type: DataTypes.UUID,
      references: {
        model: 'Job',
        key: 'id',
      },
    },
    idUser: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    before:{
      type: DataTypes.JSON,
    },
    after:{
      type: DataTypes.JSON,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    type:{
      type: DataTypes.STRING,
    }
  }, {});
  History.associate = function (models) {
    History.belongsTo(models.User, {
      foreignKey: 'idUser',
    });
    History.belongsTo(models.Job, {
      foreignKey: 'idJob',
    });
    History.belongsTo(models.CandidateJob, {
      foreignKey: 'idCard',
    });
  };
  return History;
};
