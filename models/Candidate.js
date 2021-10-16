module.exports = (sequelize, DataTypes) => {
  const Candidate = sequelize.define('Candidate', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    skill: {
      type: DataTypes.TEXT('long'),
    },
    message: {
      type: DataTypes.TEXT('long'),
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    approachDate: {
      type: DataTypes.STRING,
    },
    fromWhom: {
      type: DataTypes.STRING,
    },
    nameJob: {
      type: DataTypes.STRING,
    },
    idList: {
      type: DataTypes.STRING,
    },
    recordYear: {
      type: DataTypes.STRING,
    },
    source: {
      type: DataTypes.STRING,
    },
    facebook: {
      type: DataTypes.TEXT,
    },
    linkedin: {
      type: DataTypes.TEXT,
    },
    skype: {
      type: DataTypes.TEXT,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
  });
  Candidate.associate = function (models) {
    Candidate.belongsToMany(models.Job, {
      foreignKey: 'candidateId',
      through: "CandidateJob",
    });
    Candidate.hasMany(models.CandidateJob, {
      foreignKey: 'candidateId',
    });
  };
  return Candidate;
};
