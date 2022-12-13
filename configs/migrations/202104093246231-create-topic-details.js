'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable( 'VNU08_HELP_TOPIC_DETAIL', {
            topicId: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
            field: 'VNU08_TOPIC_ID_D'
        },
        userId: {
            type: Sequelize.INTEGER,
            field: 'VNU08_USER_ID_D'
        },
        topicName: {
          type: Sequelize.STRING,
          field: 'VNU08_TOPIC_NAME_X'
       },
      experience: {
        type: Sequelize.STRING,
        field: 'VNU08_USER_EXPERIENCE_D'
     },
     tagline: {
        type: Sequelize.STRING,
        field: 'VNU08_TAGLINE_X'
     },
     createdAt: { type: Sequelize.DATE, field: 'VNU08_CREATED_AT', },
     updatedAt: { type: Sequelize.DATE, field: 'VNU08_UPDATED_AT' }

    });
    
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU07_HELP_KEYWORD_DETAIL');
  }
};