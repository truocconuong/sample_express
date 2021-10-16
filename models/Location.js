module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    office: {
      type: DataTypes.STRING,
    },
    descLocation: {
      type: DataTypes.TEXT('long'),
    },
    linkMap: {
      type: DataTypes.TEXT('long'),
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
  Location.associate = function (models) {
    Location.hasMany(models.Job, {
      foreignKey: 'locationId',
    });
  };
  return Location;
};
