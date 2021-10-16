module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
    },
    about: {
      type: DataTypes.TEXT('long'),
    },
    website: {
      type: DataTypes.STRING,
    },
    background : {
      type:DataTypes.STRING
    },
    token: {
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
  Client.associate = function (models) {
    Client.hasMany(models.Job, {
      foreignKey: 'clientId',
    });
  };
  return Client;
};
