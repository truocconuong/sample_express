module.exports = (sequelize, DataTypes) => {
  const Lane = sequelize.define('Lane', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    nameColumn: {
      type: DataTypes.STRING,
    },
    background: {
      type: DataTypes.TEXT,
    },
    order : {
      type:DataTypes.INTEGER
    },
    disabled : {
      type: DataTypes.BOOLEAN
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
  Lane.associate = function (models) {
    // Lane.hasMany(models.History, {
    //   foreignKey: 'laneFrom',
    // });
    // Lane.hasMany(models.History, {
    //   foreignKey: 'landTo',
    // });
    Lane.hasMany(models.CandidateJob, {
      foreignKey: 'laneId',
    })
  };
  return Lane;
};
