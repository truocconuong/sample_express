module.exports = (sequelize, DataTypes) => {
  const JobSkill = sequelize.define('JobSkill', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    jobId: {
      type: DataTypes.UUID,
      references: {
        model: 'Job',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    skillId: {
      type: DataTypes.UUID,
      references: {
        model: 'Skill',
        key: 'id',
      },
      onUpdate: 'cascade',
      onDelete: 'cascade',
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
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
  JobSkill.associate = function (models) {

  };
  return JobSkill;
};
