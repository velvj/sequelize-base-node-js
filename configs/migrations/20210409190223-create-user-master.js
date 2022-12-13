'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('VNU01_USER_MASTER', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        field: 'VNU01_USER_MASTER_D'
      },
      firstName: {
        type: Sequelize.STRING,
        field: 'VNU01_FIRST_NAME_N'
      },
      lastName: {
        type: Sequelize.STRING,
        field: 'VNU01_LAST_NAME_N'
      },
      emailId: {
        type: Sequelize.STRING,
        field: 'VNU01_EMAIL_X'
      },
      password: {
        type: Sequelize.STRING,
        field: 'VNU01_PASSWORD_X'
      },
      signUpStatus: { type: Sequelize.INTEGER, field: 'VNU01_SIGNUP_STATUS' },
      emailVerifyCode: {
        type: Sequelize.INTEGER,
        field: 'VNU02_EMAIL_VERIFY_CODE_D'
      },
      forgetPasswordCode: {
        type: Sequelize.INTEGER,
        field: 'VNU02_FORGET_PASSWORD_CODE_D'
      },
      signupId: {
        type: Sequelize.INTEGER,
        field: 'VNU01_SIGNUP_TYPE_D'
      },
      typeId: {
        type: Sequelize.INTEGER,
        field: 'VNU01_TYPE_D'
      },
      status: {
        type: Sequelize.INTEGER,
        field: 'VNU01_STATUS_D'
      },
      isSocialLogin: {
        type: Sequelize.BOOLEAN,
        field: 'VNU01_IS_SOCIAL_LOGIN'
      },  
			socialLoginType: {
        type: Sequelize.INTEGER,
        field: 'VNU01_SOCIAL_LOGIN_TYPE_D'
      },  
			socialLoginCode: {
        type: Sequelize.STRING,
        field: 'VNU01_SOCIAL_LOGIN_CODE_D'
      }, 
      createdBy: {
        type: Sequelize.STRING,
        field: 'VNU01_CREATED_D'
      },
      updatedBy: {
        type: Sequelize.STRING,
        field: 'VNU01_UPDATED_D'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATETIME,
        field: 'VNU01_CREATED_AT',
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATETIME,
        field: 'VNU01_UPDATED_AT',
      },
      token: {
        type: Sequelize.STRING,
        field: 'VNU01_AUTH_TOKEN'
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('VNU01_USER_MASTER');
  }
};