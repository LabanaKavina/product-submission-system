'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords with bcrypt (salt rounds: 10)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'admin@example.com',
        password: adminPassword,
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'user@example.com',
        password: userPassword,
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: ['admin@example.com', 'user@example.com']
      }
    }, {});
  }
};
