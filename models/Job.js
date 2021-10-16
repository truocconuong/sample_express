module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT('long'),
    },
    locationId: {
      type: DataTypes.UUID,
      references: {
        model: 'Location',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    enable: {
      type: DataTypes.BOOLEAN,
    },
    type: {
      type: DataTypes.STRING,
    },
    salary: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
    time: {
      type: DataTypes.STRING,
    },
    keyword: {
      type: DataTypes.TEXT('long'),
    },
    note: {
      type: DataTypes.TEXT('long'),
    },
    aboutFetch: {
      type: DataTypes.TEXT('long'),
    },
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Client',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    responsibilities: {
      type: DataTypes.TEXT('long'),
    },
    requirement: {
      type: DataTypes.TEXT('long'),
    },
    niceToHave: {
      type: DataTypes.TEXT('long'),
    },
    benefit: {
      type: DataTypes.TEXT('long'),
    },
    metaJob: {
      type: DataTypes.STRING,
    },
    titlePage: {
      type: DataTypes.STRING,
    },
    descJob: {
      type: DataTypes.TEXT('long'),
    },
    description : {
      type: DataTypes.TEXT('long'),
    },
    interviewProcess: {
      type: DataTypes.TEXT('long'),
    },
    jobStatus: {
      type: DataTypes.STRING,
    },
    extraBenefit: {
      type: DataTypes.TEXT('long'),
    },
    folderId : {
      type:DataTypes.TEXT
    },
    externalRecruiter: {
      type: DataTypes.BOOLEAN
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
  Job.associate = function (models) {
    Job.belongsToMany(models.Skill, {
      through: 'JobSkill',
      foreignKey: 'jobId',
    });
    Job.belongsToMany(models.User, {
      through: 'UserJob',
      foreignKey: 'jobId',
    });
    Job.belongsTo(models.Location, {
      foreignKey: 'locationId',
    });
    Job.belongsTo(models.Client, {
      foreignKey: 'clientId',
    });
    Job.belongsToMany(models.Candidate, {
      through: "CandidateJob",
      foreignKey: "jobId"
    });
    Job.hasMany(models.CandidateJob,{
      foreignKey : 'jobId'
    });
    Job.hasMany(models.UserJob, {
      foreignKey : 'jobId'
    });
    Job.belongsToMany(models.Tag, {
      through: 'JobTag',
      foreignKey: 'jobId',
    });
  };
  return Job;
};
