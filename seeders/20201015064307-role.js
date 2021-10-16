module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Role', [
    {
      id: '48185027-b261-4766-91b7-b1c1343b0f29',
      name: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4cfbcf03-7f25-4c44-abb2-712ac449583d',
      name: 'Leader',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '8e2132e2-016a-4891-9813-5365e2672159',
      name: 'Menber',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Role', null, {}),
};
