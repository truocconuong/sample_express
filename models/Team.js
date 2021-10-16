module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
    idLeader: {
      type: DataTypes.UUID,
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
  Team.associate = function (models) {
    Team.hasMany(models.User, {
      foreignKey: 'teamId',
    });
  };
  return Team;
};
