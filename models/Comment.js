module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    content: {
      type: DataTypes.JSON,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    candidateJobId: {
      type: DataTypes.UUID,
      references: {
        model: 'CandidateJob',
        key: 'id',
      },
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
  

  Comment.associate = function (models) {
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
    });
  };
  return Comment;
};
