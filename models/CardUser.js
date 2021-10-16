module.exports = (sequelize, DataTypes) => {
  const CardUser = sequelize.define('CardUser', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'User',
        key: 'id',
      },
      onUpdate: 'cascade',
    },
    cardId: {
      type: DataTypes.UUID,
      references: {
        model: 'CandidateJob',
        key: 'id',
      },
      onUpdate: 'cascade',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {});
  CardUser.associate = function (models) {
    CardUser.belongsTo(models.User, {
			foreignKey: 'userId'
		});
		CardUser.belongsTo(models.CandidateJob, {
			foreignKey: 'cardId'
    });
  };
  return CardUser;
};
