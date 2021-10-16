module.exports = (sequelize, DataTypes) => {
  const ContentTask = sequelize.define(
    "ContentTask",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      taskId: {
        type: DataTypes.INTEGER,
      },
      content: {
        type: DataTypes.STRING,
      },
      percent: {
        type: DataTypes.STRING,
      },
      target: {
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {}
  );
  ContentTask.associate = function (models) {
    ContentTask.belongsTo(models.Task, {
      foreignKey: "taskId",
    });
  };
  return ContentTask;
};
