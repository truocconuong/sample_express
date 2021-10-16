module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: 'Role',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Team',
        key: 'id',
      },
      onUpdate: 'set null',
      onDelete: 'set null',
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
    linkAvatar: {
      type: DataTypes.STRING,
    },
    tokenAuth: {
      type: DataTypes.TEXT('long'),
    },
    tokenTimeStamp: {
      type: DataTypes.TEXT('long'),
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
    },
    isVerify: {
      type: DataTypes.BOOLEAN,
    },
    codeVerify: {
      type: DataTypes.TEXT,
    },
    showRules : {
      type:DataTypes.BOOLEAN
    },
    social : {
      type:DataTypes.TEXT
    },
    socialId : {
      type:DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  }, {});
  User.associate = function (models) {
    User.belongsToMany(models.Job, {
      through: 'UserJob',
      foreignKey: 'userId',
    });
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
    });
    User.belongsTo(models.Team, {
      foreignKey: 'teamId',
    });
    User.hasMany(models.Task, {
      foreignKey: 'userId',
    });
    User.hasMany(models.Notification, {
      foreignKey: 'userId',
    });
    User.hasMany(models.Interview, {
      foreignKey: 'userId',
    })
    User.hasMany(models.CandidateJob, {
      foreignKey: 'userCreate',
    })
    User.hasOne(models.BankRecruiter, {
      foreignKey: 'recruiterId',
    })
    User.hasMany(models.TaskUser, {
      foreignKey: 'userId'
    })
  };
  return User;
};

