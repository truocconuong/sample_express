module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Job", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.TEXT("long"),
      },
      locationId: {
        type: Sequelize.UUID,
        references: {
          model: "Location",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      enable: {
        type: Sequelize.BOOLEAN,
      },
      type: {
        type: Sequelize.STRING,
      },
      salary: {
        type: Sequelize.STRING,
      },
      slug: {
        type: Sequelize.STRING,
      },
      time: {
        type: Sequelize.STRING,
      },
      keyword: {
        type: Sequelize.TEXT("long"),
      },
      note: {
        type: Sequelize.TEXT("long"),
      },
      description: {
        type: Sequelize.TEXT("long"),
      },
      jobStatus: {
        type: Sequelize.STRING,
      },
      aboutFetch: {
        type: Sequelize.TEXT("long"),
      },
      clientId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Client",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      responsibilities: {
        type: Sequelize.TEXT("long"),
      },
      requirement: {
        type: Sequelize.TEXT("long"),
      },
      niceToHave: {
        type: Sequelize.TEXT("long"),
      },
      benefit: {
        type: Sequelize.TEXT("long"),
      },
      metaJob: {
        type: Sequelize.STRING,
      },
      titlePage: {
        type: Sequelize.STRING,
      },
      descJob: {
        type: Sequelize.TEXT("long"),
      },
      interviewProcess: {
        type: Sequelize.TEXT("long"),
      },
      extraBenefit: {
        type: Sequelize.TEXT("long"),
      },
      folderId: {
        type: Sequelize.TEXT,
      },
      externalRecruiter: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Job");
  },
};
