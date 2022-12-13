'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU07_HELP_KEYWORD_DETAIL', {
        detailId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU07_DETAIL_ID_D'
    },
    userId: {
      type: Sequelize.INTEGER,
      field: 'VNU07_USER_ID_D'
  },
  topicId:{
    type:Sequelize.INTEGER,
    field:"VNU07_TOPIC_ID_D"
},
  keywords: {
    type: Sequelize.STRING,
    field: 'VNU07_KEYWORDS_X'
},
  createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU07_CREATED_AT' 
  },
  updatedAt: { type: Sequelize.DATE, field: 'VNU07_UPDATED_AT' }


    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU07_HELP_KEYWORD_DETAIL');
  }
};