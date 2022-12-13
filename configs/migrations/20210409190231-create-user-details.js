'use strict';
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU02_USER_DETAIL', {
    detailId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU02_DETAIL_D'
    },
    userId: {
        type: Sequelize.STRING,
        field: 'VNU02_USER_MASTER__D'
    },
    emailId: {
        type: Sequelize.STRING,
        field: 'VNU02_EMAIL_X'
    },
    emailStatus: { 
        type: Sequelize.INTEGER, 
        field: 'VNU02_EMAIL_STATUS_D' 
    },
    signupStatus: {
        type: Sequelize.INTEGER,
        field: 'VNU02_SIGNUP_STATUS_D'
    },
    termsType: { 
        type: Sequelize.INTEGER,
        field: 'VNU02_TERMS_TYPE_D'
    },
    userImage: {
        type: Sequelize.STRING,
        field: 'VNU02_USER_IMAGE_X'
    },
    firstName: {
        type: Sequelize.STRING,
        field: 'VNU02_FIRST_NAME_N'
    },
    lastName: {
        type: Sequelize.STRING,
        field: 'VNU02_LAST_NAME_N'
    }, 
    country: {
        type: Sequelize.STRING,
        field: 'VNU02_COUNTRY_X'
    },
    state: {
        type: Sequelize.STRING,
        field: 'VNU02_STATE_X'
     },
    city: {
        type: Sequelize.STRING,
        field: 'VNU02_CITY_X'
    },
    likes: {
        type: Sequelize.INTEGER,
        field: 'VNU02_LIKES_COUNT_D'
    },
    helps: {
        type: Sequelize.INTEGER,
        field: 'VNU02_HELPED_COUNT_D'
    },
    socialLinks: {
        type: Sequelize.STRING,
        field: 'VNU02_SOCIAL_LINKS_X'
    },
    userBio: {
        type: Sequelize.STRING,
        field: 'VNU02_USER_BIO_X'
    },
    topicName: {
        type: Sequelize.STRING,
        field: 'VNU02_TOPIC_NAME_X'
    },
    userExperience: {
        type: Sequelize.STRING,
        field: 'VNU02_USER_EXPERIENCE_X'
    },
    helpKeywords: {
        type: Sequelize.STRING,
        field: 'VNU02_HELP_KEYWORDS_X'
    },
    refferedBy: {
        type: Sequelize.STRING,
        field: 'VNU02_REFFERED_BY_X'
    },
    refferalCode: {
        type: Sequelize.STRING,
        field: 'VNU02_REFFERAL_CODE_X'
    },
	status: { 
        type: Sequelize.INTEGER,
        field: 'VNU01_STATUS_D'
    },        
    createdBy: {
        type: Sequelize.INTEGER,
        field: 'VNU02_CREATED_D'
    },
    updatedBy: {
        type: Sequelize.INTEGER,
        field: 'VNU02_UPDATED_D'
    },
    createdAt: {
        type: Sequelize.DATETIME, 
        field: 'VNU02_CREATED_AT' 
    },
	updatedAt: { 
        type: Sequelize.DATETIME, 
        field: 'VNU02_UPDATED_AT' 
    }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU02_USER_DETAIL');
  }
};