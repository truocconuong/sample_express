module.exports = (sequelize, DataTypes) => {
  const SystemParameter = sequelize.define('SystemParameter', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    key : {
      type: DataTypes.STRING
    },
    value : {
      type: DataTypes.TEXT
    },
    description : {
      type: DataTypes.TEXT
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
 
  return SystemParameter;
};
