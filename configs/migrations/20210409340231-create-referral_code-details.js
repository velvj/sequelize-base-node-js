'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU05_REFFERAL_CODE_DETAIL', {
        refferalId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU05_REFFERAL_ID_D'
    },
    refferalCode: {
      type: Sequelize.STRING,
      field: 'VNU05_REFFERAL_CODE_X'
  },
  generatedBy: {
    type: Sequelize.STRING,
    field: 'VNU05_GENERATED_BY_X'
},
    status: { 
        type: Sequelize.STRING, 
        field: 'VNU05_REFFERAL_STATUS_D' 
    },
    usedBy: { 
      type: Sequelize.STRING, 
      field: 'VNU05_USED_BY_X' 
  },
  usedAt: {
    type: Sequelize.DATETIME, 
    field: 'VNU05_USED_AT' 
  },
  createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU05_CREATED_AT' 
  },
  updatedAt: { type: Sequelize.DATETIME, field: 'VNU05_UPDATED_AT', defaultValue: sequelize.NOW }


    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU05_REFFERAL_CODE_DETAIL');
  }
};