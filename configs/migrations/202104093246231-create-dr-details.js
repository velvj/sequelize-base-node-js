'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable( 'VNU10_DIRECT_REQUEST_DETAIL', {
        drId: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
            field: 'VNU10_DIRECT_ID_D'
        },
        userId: {
          type: Sequelize.INTEGER,
          field: 'VNU10_TO_USER_ID_D'
      },
      toUserId:{
          type:Sequelize.INTEGER,
          field:"VNU10_TO_USER_ID_D"
      },
      topicId:{
        type:Sequelize.INTEGER,
        field:"VNU10_TO_TOPIC_ID_D"
    },
      message: {
        type: Sequelize.STRING,
        field: 'VNU10_MESSAGE_X'
    },
    status:{
        type:Sequelize.INTEGER,
        field:"VNU10_STATUS_D"
    },
    createdAt: { type: Sequelize.DATETIME, field: 'VNU10_CREATED_AT'},
    updatedAt: { type: Sequelize.DATETIME, field: 'VNU10_UPDATED_AT'}},

    );
    
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU10_DIRECT_REQUEST_DETAIL');
  }
};