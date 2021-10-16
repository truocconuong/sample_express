module.exports = (sequelize, DataTypes) => {
  const BankRecruiter = sequelize.define('BankRecruiter', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    bankNumber: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING
    },
    bankName: {
      type: DataTypes.STRING
    },
    recruiterId: {
      type: DataTypes.UUID,
      references: {
        models: 'User',
        key: 'id'
      }
    },
    urlFrontImageIdCard: {
      type: DataTypes.TEXT,
    },
    urlBehindImageIdCard: {
      type: DataTypes.TEXT,
    }
  })
  BankRecruiter.associate = function (models) {
    BankRecruiter.belongsTo(models.User, {
      foreignKey: 'recruiterId',
    })
  }
  return BankRecruiter;
};