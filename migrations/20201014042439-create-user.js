module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('User', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      roleId: {
        type: Sequelize.UUID,
        references: {
          model: 'Role',
          key: 'id',
        },
        onUpdate: 'cascade',
        onDelete: 'cascade',
      },
      teamId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Team',
          key: 'id',
        },
        onUpdate: 'set null',
        onDelete: 'set null',
      },
      email: {
        type: Sequelize.STRING,
      },
      password: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      lastLogin: {
        type: Sequelize.DATE,
      },
      linkAvatar: {
        type: Sequelize.STRING,
      },
      tokenAuth: {
        type: Sequelize.TEXT('long'),
      },
      tokenTimeStamp: {
        type: Sequelize.TEXT('long'),
      },
      isDelete: {
        type: Sequelize.BOOLEAN,
      },
      isVerify: {
        type: Sequelize.BOOLEAN,
      },
      codeVerify: {
        type: Sequelize.TEXT,
      },
      showRules : {
        type:Sequelize.BOOLEAN
      },
      social : {
        type:Sequelize.TEXT
      },
      socialId : {
        type:Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('User');
  },
};
