'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU04_WAITLIST_DETAIL', {
    waitlistId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU04_WAITLIST_D'
    },
    firstName: {
        type: Sequelize.STRING,
        field: 'VNU04_FIRST_NAME_N'
    },
    lastName: {
        type: Sequelize.STRING,
        field: 'VNU04_LAST_NAME_N'
    }, 
    emailId: {
        type: Sequelize.STRING,
        field: 'VNU04_EMAIL_X'
    },
    createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU04_CREATED_AT' 
    },
	updatedAt: { 
        type: Sequelize.DATETIME, 
        field: 'VNU04_UPDATED_AT' 
    }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU04_WAITLIST_DETAIL');
  }
};