module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Team', [
    {
      id: 1,
      name: 'Team 1',
      idLeader: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Team', null, {}),
};
