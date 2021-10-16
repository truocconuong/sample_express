module.exports = (sequelize, DataTypes) => {
  const NotificationRecruiter = sequelize.define('NotificationRecruiter', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    recruiterId: {
      type: DataTypes.UUID,
    },
    candidateJobId: {
      type: DataTypes.UUID,
    },
    content: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
  return NotificationRecruiter;
};
