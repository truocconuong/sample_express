module.exports = (sequelize, DataTypes) => {
  const Email = sequelize.define('Email', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    createdBy: {
      type: DataTypes.STRING,
    },
    createdTime: {
      type: DataTypes.DATE,
    },
    emailTo: {
      type: DataTypes.STRING,
    },
    inCC: {
      type: DataTypes.STRING,
    },
    body: {
      type: DataTypes.TEXT('long'),
    },
    emailType: {
      type: DataTypes.STRING,
    },
    statusEmail: {
      type: DataTypes.STRING,
    },
    sentTime: {
      type: DataTypes.DATE,
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
  Email.associate = function (models) {

  };
  return Email;
};
