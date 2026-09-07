'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Insert 2 sample users
    await queryInterface.bulkInsert('Users', [
      {
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        createdAt: now,
        updatedAt: now
      }
    ]);

    // 2. Query inserted User IDs dynamically
    const users = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Users";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const idOf = (name) => users.find((u) => u.name === name).id;

    // 3. Insert tasks linked via foreign keys
    await queryInterface.bulkInsert('Tasks', [
      {
        title: 'Task 1: Setup Environment',
        dueDate: new Date(),
        completed: true,
        userId: idOf('John Doe'),
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Task 2: Configure Database',
        dueDate: new Date(),
        completed: false,
        userId: idOf('John Doe'),
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Task 3: Build REST API',
        dueDate: new Date(),
        completed: false,
        userId: idOf('Jane Smith'),
        createdAt: now,
        updatedAt: now
      },
      {
        title: 'Task 4: Run Postman Tests',
        dueDate: new Date(),
        completed: false,
        userId: idOf('Jane Smith'),
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};