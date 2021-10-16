
module.exports = (sequelize, DataTypes) => {
  const TaskUser = sequelize.define('TaskUser', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,

    },
    taskId: {
      type: DataTypes.UUID,
      references: {
        model: 'ListTask',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
  });
  TaskUser.associate = function (models) {
    TaskUser.belongsTo(models.ListTask, {
      foreignKey: 'taskId',
    })
    TaskUser.belongsTo(models.User, {
      foreignKey: 'userId',
    })
  }
  return TaskUser;
};