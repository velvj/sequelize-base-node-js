'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU06_BLOCK_REPORT_USER_DETAIL', {
        detailId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU06_DETAIL_ID_D'
    },
    userId: {
      type: Sequelize.STRING,
      field: 'VNU06_USER_ID_D'
  },
  type: {
    type: Sequelize.STRING,
    field: 'VNU06_TYPE_X'
},
    reason: { 
        type: Sequelize.INTEGER, 
        field: 'VNU06_REASON_X' 
    },
    createdBy: { 
      type: Sequelize.STRING, 
      field: 'VNU06_CREATED_BY' 
  },
  createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU06_CREATED_AT' 
  }

    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU06_BLOCK_REPORT_USER_DETAIL');
  }
};