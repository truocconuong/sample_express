module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('User', [
    {
      id: '56b22b75-18c4-4b28-b194-f0dbafe87304',
      roleId: '48185027-b261-4766-91b7-b1c1343b0f29',
      teamId: 1,
      email: 'hoangkhanh@gmail.com',
      password: '$2a$10$sHBq4eofuc5NikXNZmEuVe.XiZaBeK2D6.JhP.m4lo1UK3eDVYDQy',
      name: 'khanh',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('User', null, {}),
};
