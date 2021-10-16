module.exports = (sequelize, DataTypes) => {
  const ListTask = sequelize.define('ListTask', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    dueDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.STRING,
    },
    tag: {
      type: DataTypes.STRING,
    },
    parentId: {
      allowNull: true,
      type: DataTypes.UUID,
      defaultValue: null,
    },
  }, {
  });
  ListTask.associate = function (models) {
    ListTask.hasMany(models.TaskUser, {
      foreignKey: 'taskId',
    });
    ListTask.belongsToMany(models.User, {
      through: models.TaskUser,
      foreignKey: 'taskId',
    });


    
  };

  return ListTask;
};