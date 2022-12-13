'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU03_TERMS_DETAIL', {
        termId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU03_TERM_D'
    },
    userId: {
      type: Sequelize.STRING,
      field: 'VNU03_USER_MASTER__D'
  },
    data: { 
        type: Sequelize.INTEGER, 
        field: 'VNU03_DATA_X' 
    },
    termsType: { 
      type: Sequelize.INTEGER, 
      field: ' VNU03_TERMS_TYPE_D' 
  },
    createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU03_CREATED_AT' 
    },
	updatedAt: { 
        type: Sequelize.DATETIME, 
        field: 'VNU03_UPDATED_AT' 
    }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU03_TERMS_DETAIL');
  }
};