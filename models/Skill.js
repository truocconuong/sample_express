module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
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
  Skill.associate = function (models) {
    Skill.belongsToMany(models.Job, {
      through: 'JobSkill',
      foreignKey: 'skillId',
    });
    Skill.hasMany(models.JobSkill)
  };
  return Skill;
};
