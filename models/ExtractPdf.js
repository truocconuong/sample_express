module.exports = (sequelize, DataTypes) => {
  const ExtractPdf = sequelize.define('ExtractPdf', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    url: {
      type: DataTypes.TEXT
    },
    candidateJobId: {
      type: DataTypes.STRING
    },
    isRefine: {
      type: DataTypes.BOOLEAN,
      defaultValue : false
    },
    nameFile : {
      type:DataTypes.TEXT
    },
    folderId : {
      type:DataTypes.TEXT
    },
    message : {
      type:DataTypes.JSON
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
  return ExtractPdf;
};
