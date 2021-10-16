module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
    },
    content: {
      type: DataTypes.JSON,
    },
    type: {
      type :DataTypes.STRING
    },
    status: {
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
  }, {
    tableName: 'Notifications',
  });


  Notification.associate = function (models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };

  return Notification;
};
